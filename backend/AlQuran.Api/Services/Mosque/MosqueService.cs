using System.Globalization;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Mosque;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.Overpass;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Mosque;

/// <summary>
/// Nearby mosques, from OpenStreetMap data via Overpass.
///
/// Public Overpass instances are volunteer-run and go busy without warning. We
/// saw all three configured endpoints fail at different moments while building
/// this, so the service tries each in turn and only reports failure when every
/// one of them is unreachable.
/// </summary>
public sealed class MosqueService : ExternalApiClientBase, IMosqueService
{
    /// <summary>Required by the ODbL licence and shown in the UI.</summary>
    public const string Attribution = "© OpenStreetMap contributors";

    private readonly ICacheService _cache;
    private readonly OverpassApiOptions _options;
    private readonly TimeSpan _cacheDuration;

    public MosqueService(
        IHttpClientFactory httpClientFactory,
        ILogger<MosqueService> logger,
        ICacheService cache,
        IOptions<OverpassApiOptions> options,
        IOptions<CacheOptions> cacheOptions)
        : base(
            httpClientFactory.CreateClient(ExternalApiRegistry.OverpassApi),
            logger,
            "Overpass (OpenStreetMap)")
    {
        _cache = cache;
        _options = options.Value;
        _cacheDuration = TimeSpan.FromMinutes(cacheOptions.Value.MosqueMinutes);
    }

    public async Task<MosqueSearchDto> FindNearbyAsync(
        double latitude,
        double longitude,
        int? radiusMeters = null,
        int? limit = null,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        var radius = Math.Clamp(radiusMeters ?? _options.DefaultRadiusMeters, 100, 50_000);
        var take = Math.Clamp(limit ?? _options.MaxResults, 1, _options.MaxResults);

        // Coordinates are rounded in the key so nearby users share a cache entry
        // and no precise position is ever stored. Three places is about 110 m.
        var key = $"mosques:{Round(latitude)}:{Round(longitude)}:{radius}:{take}";

        var result = await _cache.GetOrCreateAsync(
            key,
            _cacheDuration,
            ct => QueryWithFailoverAsync(latitude, longitude, radius, take, ct),
            cancellationToken);

        var mosques = result.Response.Elements
            .Select(element => MosqueMapper.Map(element, latitude, longitude))
            .Where(mosque => mosque is not null)
            .Select(mosque => mosque!)
            .OrderBy(mosque => mosque.DistanceMeters)
            .Take(take)
            .ToList();

        return new MosqueSearchDto(
            latitude,
            longitude,
            radius,
            mosques,
            result.Endpoint,
            Attribution,
            ContentNotices.MosqueDataCommunity);
    }

    /// <summary>Which endpoint answered, and what it said.</summary>
    private sealed record QueryResult(string Endpoint, OverpassResponse Response);

    /// <summary>
    /// Tries the primary endpoint, then each mirror, stopping at the first that
    /// answers. Only when all of them fail does the caller see an error.
    /// </summary>
    private async Task<QueryResult> QueryWithFailoverAsync(
        double latitude,
        double longitude,
        int radius,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = OverpassQueryBuilder.Build(
            latitude, longitude, radius, limit, _options.TimeoutSeconds);

        var endpoints = _options.AllEndpoints;

        if (endpoints.Count == 0)
        {
            throw new ExternalApiException(ServiceName, "No Overpass endpoint is configured.");
        }

        ExternalApiException? lastFailure = null;

        for (var index = 0; index < endpoints.Count; index++)
        {
            var endpoint = endpoints[index];

            try
            {
                var response = await PostQueryAsync(endpoint, query, cancellationToken);

                if (index > 0)
                {
                    Logger.LogInformation(
                        "Overpass mirror {Endpoint} answered after {Failed} earlier endpoint(s) failed",
                        endpoint, index);
                }

                return new QueryResult(endpoint, response);
            }
            catch (Exception ex)
            {
                Logger.LogWarning(
                    "Overpass endpoint {Endpoint} failed ({Message}); trying the next one",
                    endpoint, ex.Message);

                lastFailure = ex as ExternalApiException
                    ?? new ExternalApiException(ServiceName, ex.Message, innerException: ex);
            }
        }

        throw new ExternalApiException(
            ServiceName,
            "Every OpenStreetMap mosque server is busy right now. Please try again in a moment.",
            lastFailure?.UpstreamStatusCode,
            lastFailure);
    }

    /// <summary>
    /// Sends the query to one endpoint. The request URI is absolute because each
    /// mirror has its own host, so it cannot rely on the client base address.
    /// </summary>
    private Task<OverpassResponse> PostQueryAsync(
        string endpoint,
        string query,
        CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new FormUrlEncodedContent(
            [
                new KeyValuePair<string, string>("data", query),
            ]),
        };

        return SendJsonAsync<OverpassResponse>(request, cancellationToken);
    }

    private static void ValidateCoordinates(double latitude, double longitude)
    {
        if (double.IsNaN(latitude) || latitude < -90 || latitude > 90)
        {
            throw new RequestValidationException(
                "Latitude must be between -90 and 90.", nameof(latitude));
        }

        if (double.IsNaN(longitude) || longitude < -180 || longitude > 180)
        {
            throw new RequestValidationException(
                "Longitude must be between -180 and 180.", nameof(longitude));
        }
    }

    private static string Round(double value) =>
        Math.Round(value, 3).ToString("0.###", CultureInfo.InvariantCulture);
}
