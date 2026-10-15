using System.Diagnostics;
using System.Reflection;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Common;
using AlQuran.Api.DTOs.Meta;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Meta;

/// <inheritdoc cref="IMetaService"/>
public sealed class MetaService : IMetaService
{
    private static readonly DateTimeOffset StartedAtUtc = DateTimeOffset.UtcNow;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<MetaService> _logger;
    private readonly IReadOnlyDictionary<string, ExternalApiOptions> _options;

    public MetaService(
        IHttpClientFactory httpClientFactory,
        IHostEnvironment environment,
        ILogger<MetaService> logger,
        IOptions<QuranApiOptions> quran,
        IOptions<QuranAudioOptions> audio,
        IOptions<PrayerApiOptions> prayer,
        IOptions<GeocodingApiOptions> geocoding,
        IOptions<OverpassApiOptions> overpass)
    {
        _httpClientFactory = httpClientFactory;
        _environment = environment;
        _logger = logger;

        _options = new Dictionary<string, ExternalApiOptions>(StringComparer.OrdinalIgnoreCase)
        {
            [ExternalApiRegistry.QuranApi] = quran.Value,
            [ExternalApiRegistry.QuranAudio] = audio.Value,
            [ExternalApiRegistry.PrayerApi] = prayer.Value,
            [ExternalApiRegistry.GeocodingApi] = geocoding.Value,
            [ExternalApiRegistry.OverpassApi] = overpass.Value,
        };
    }

    public AppInfoDto GetAppInfo()
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";

        var apis = ExternalApiRegistry.All
            .Select(descriptor =>
            {
                var options = _options[descriptor.Key];
                return new ExternalApiInfoDto(
                    descriptor.Key,
                    string.IsNullOrWhiteSpace(options.DisplayName) ? descriptor.Provider : options.DisplayName,
                    descriptor.Purpose,
                    options.BaseUrl,
                    string.IsNullOrWhiteSpace(options.DocsUrl) ? descriptor.DocsUrl : options.DocsUrl,
                    descriptor.IsFree,
                    descriptor.RequiresApiKey,
                    options.HasApiKey,
                    options.Enabled);
            })
            .ToList();

        return new AppInfoDto(
            "Al-Quran Web API",
            version,
            _environment.EnvironmentName,
            DateTimeOffset.UtcNow,
            apis);
    }

    public HealthDto GetHealth() => new(
        "Healthy",
        DateTimeOffset.UtcNow,
        Math.Round((DateTimeOffset.UtcNow - StartedAtUtc).TotalSeconds, 1));

    public async Task<UpstreamHealthReportDto> CheckUpstreamsAsync(CancellationToken cancellationToken = default)
    {
        var checks = ExternalApiRegistry.All
            .Select(descriptor => CheckOneAsync(descriptor, cancellationToken));

        var results = await Task.WhenAll(checks).ConfigureAwait(false);

        var status = results.All(r => r.Healthy || !_options[r.Key].Enabled) ? "Healthy" : "Degraded";
        return new UpstreamHealthReportDto(status, DateTimeOffset.UtcNow, results);
    }

    private async Task<UpstreamHealthDto> CheckOneAsync(
        ExternalApiRegistry.Descriptor descriptor,
        CancellationToken cancellationToken)
    {
        var options = _options[descriptor.Key];

        if (!options.Enabled)
        {
            return new UpstreamHealthDto(
                descriptor.Key, descriptor.Provider, Healthy: false, StatusCode: null,
                LatencyMs: 0, Message: "Disabled in configuration.");
        }

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var client = _httpClientFactory.CreateClient(descriptor.Key);
            using var request = BuildHealthRequest(descriptor, options);

            using var response = await client
                .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                .ConfigureAwait(false);

            stopwatch.Stop();

            return new UpstreamHealthDto(
                descriptor.Key,
                descriptor.Provider,
                response.IsSuccessStatusCode,
                (int)response.StatusCode,
                stopwatch.ElapsedMilliseconds,
                response.IsSuccessStatusCode ? "Reachable." : $"Responded with {(int)response.StatusCode}.");
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogWarning(ex, "Upstream health check failed for {Provider}", descriptor.Provider);

            return new UpstreamHealthDto(
                descriptor.Key,
                descriptor.Provider,
                Healthy: false,
                StatusCode: null,
                stopwatch.ElapsedMilliseconds,
                "Unreachable: " + ex.GetType().Name);
        }
    }

    private static HttpRequestMessage BuildHealthRequest(
        ExternalApiRegistry.Descriptor descriptor,
        ExternalApiOptions options)
    {
        // Overpass has no cheap GET endpoint, so we post the smallest valid query.
        if (descriptor.Key == ExternalApiRegistry.OverpassApi)
        {
            return new HttpRequestMessage(HttpMethod.Post, string.Empty)
            {
                Content = new FormUrlEncodedContent(
                [
                    new KeyValuePair<string, string>("data", "[out:json][timeout:10];node(1);out ids 1;"),
                ]),
            };
        }

        // The audio CDN only needs a HEAD to prove the file is served.
        var method = descriptor.Key == ExternalApiRegistry.QuranAudio ? HttpMethod.Head : HttpMethod.Get;
        return new HttpRequestMessage(method, descriptor.HealthCheckPath);
    }
}
