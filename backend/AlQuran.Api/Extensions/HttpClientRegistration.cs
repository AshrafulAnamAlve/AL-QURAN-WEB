using System.Net;
using AlQuran.Api.Configuration;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Extensions;

/// <summary>
/// Registers one named HttpClient per third-party API, each with its own base
/// address, timeout and resilience pipeline (retry, circuit breaker, timeout).
/// Using IHttpClientFactory rather than `new HttpClient()` avoids socket
/// exhaustion and stale DNS - the two classic HttpClient bugs.
/// </summary>
public static class HttpClientRegistration
{
    /// <summary>
    /// Sent on every outgoing request. The OpenStreetMap services (Nominatim and
    /// Overpass) require a descriptive User-Agent and block anonymous traffic.
    /// </summary>
    public const string DefaultUserAgent = "AlQuranWeb/1.0 (+https://github.com/your-username/al-quran-web)";

    public static IServiceCollection AddExternalApiClients(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddExternalApiClient<QuranApiOptions>(
            configuration, ExternalApiRegistry.QuranApi, QuranApiOptions.SectionName, retries: 2);

        services.AddExternalApiClient<QuranAudioOptions>(
            configuration, ExternalApiRegistry.QuranAudio, QuranAudioOptions.SectionName, retries: 1);

        services.AddExternalApiClient<PrayerApiOptions>(
            configuration, ExternalApiRegistry.PrayerApi, PrayerApiOptions.SectionName, retries: 2);

        // Nominatim asks for at most one request per second, so we do not retry hard.
        services.AddExternalApiClient<GeocodingApiOptions>(
            configuration, ExternalApiRegistry.GeocodingApi, GeocodingApiOptions.SectionName, retries: 1);

        // Overpass is volunteer-run and goes busy under load. Retrying the same
        // instance rarely helps, so we keep it at the Polly minimum of 1 and let the
        // service layer fail over to a mirror instead, with circuit breaker disabled so failover is never blocked.
        services.AddExternalApiClient<OverpassApiOptions>(
            configuration, ExternalApiRegistry.OverpassApi, OverpassApiOptions.SectionName, retries: 1, enableCircuitBreaker: false);

        return services;
    }

    private static void AddExternalApiClient<TOptions>(
        this IServiceCollection services,
        IConfiguration configuration,
        string clientName,
        string sectionName,
        int retries,
        bool enableCircuitBreaker = true)
        where TOptions : ExternalApiOptions
    {
        // Polly rejects a retry count below 1, so 1 is the floor everywhere.
        retries = Math.Max(1, retries);

        // The resilience pipeline is built once at startup and cannot read IOptions
        // lazily, so we take the timeout straight from configuration here.
        var timeoutSeconds = configuration.GetValue<int?>($"{sectionName}:TimeoutSeconds") ?? 20;
        var attemptTimeout = TimeSpan.FromSeconds(timeoutSeconds);

        services
            .AddHttpClient(clientName, (provider, client) =>
            {
                var options = provider.GetRequiredService<IOptions<TOptions>>().Value;

                client.BaseAddress = new Uri(options.IsSingleEndpoint
                    ? options.BaseUrl
                    : EnsureTrailingSlash(options.BaseUrl));

                // The resilience pipeline owns timeouts; this is only a backstop.
                client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds * (retries + 1) + 10);

                var userAgent = options is GeocodingApiOptions geo && !string.IsNullOrWhiteSpace(geo.UserAgent)
                    ? geo.UserAgent
                    : DefaultUserAgent;

                client.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
            })
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                // Sends Accept-Encoding AND decompresses the reply. Setting the
                // header by hand without this leaves the body gzipped, and every
                // JSON parse fails with a message that looks like a provider bug.
                AutomaticDecompression = DecompressionMethods.GZip
                                         | DecompressionMethods.Deflate
                                         | DecompressionMethods.Brotli,
            })
            .AddStandardResilienceHandler(resilience =>
            {
                resilience.AttemptTimeout.Timeout = attemptTimeout;
                resilience.TotalRequestTimeout.Timeout = attemptTimeout * (retries + 1);

                resilience.Retry.MaxRetryAttempts = retries;
                resilience.Retry.UseJitter = true;

                if (enableCircuitBreaker)
                {
                    // Polly requires the sampling window to be at least twice the attempt timeout.
                    resilience.CircuitBreaker.SamplingDuration = attemptTimeout * 2;
                    resilience.CircuitBreaker.MinimumThroughput = 10;
                    resilience.CircuitBreaker.FailureRatio = 0.9;
                }
                else
                {
                    // Set throughput to int.MaxValue so the circuit breaker never opens and blocks mirror failover.
                    resilience.CircuitBreaker.SamplingDuration = attemptTimeout * 2;
                    resilience.CircuitBreaker.MinimumThroughput = int.MaxValue;
                    resilience.CircuitBreaker.FailureRatio = 1.0;
                }
            });
    }

    private static string EnsureTrailingSlash(string url) =>
        url.EndsWith('/') ? url : url + "/";
}
