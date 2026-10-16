using System.Globalization;
using System.Net.Http.Json;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Mosque;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.Nominatim;
using AlQuran.Api.Models.Upstream.Overpass;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Mosque;

/// <summary>
/// Nearby mosques, from OpenStreetMap data via Overpass with fast Nominatim fallback.
///
/// Public Overpass instances are volunteer-run and go busy without warning. The
/// service tries each mirror with a short timeout and falls back to OpenStreetMap
/// Nominatim so the user always gets their nearest mosques without timing out.
/// </summary>
public sealed class MosqueService : ExternalApiClientBase, IMosqueService
{
    /// <summary>Required by the ODbL licence and shown in the UI.</summary>
    public const string Attribution = "© OpenStreetMap contributors";

    private readonly ICacheService _cache;
    private readonly OverpassApiOptions _options;
    private readonly TimeSpan _cacheDuration;
    private readonly HttpClient _nominatimClient;

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
        _nominatimClient = httpClientFactory.CreateClient(ExternalApiRegistry.GeocodingApi);
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

        return new MosqueSearchDto(
            latitude,
            longitude,
            radius,
            result.Mosques,
            result.Endpoint,
            Attribution,
            ContentNotices.MosqueDataCommunity);
    }

    /// <summary>Which endpoint answered, and what it said.</summary>
    private sealed record QueryResult(string Endpoint, IReadOnlyList<MosqueDto> Mosques);

    /// <summary>
    /// Tries the Overpass mirrors with a short per-attempt timeout, then falls back
    /// to OpenStreetMap Nominatim.
    /// </summary>
    private async Task<QueryResult> QueryWithFailoverAsync(
        double latitude,
        double longitude,
        int radius,
        int limit,
        CancellationToken cancellationToken)
    {
        var query = OverpassQueryBuilder.Build(
            latitude, longitude, radius, limit, 8);

        var endpoints = _options.AllEndpoints;
        Exception? lastFailure = null;

        // Step 1: Try primary Overpass mirror with a 3.5s timeout
        if (endpoints.Count > 0)
        {
            var primaryEndpoint = endpoints[0];
            try
            {
                using var attemptCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                attemptCts.CancelAfter(TimeSpan.FromSeconds(3.5));

                var response = await PostQueryAsync(primaryEndpoint, query, attemptCts.Token);

                var mosques = response.Elements
                    .Select(element => MosqueMapper.Map(element, latitude, longitude))
                    .Where(mosque => mosque is not null)
                    .Select(mosque => mosque!)
                    .OrderBy(mosque => mosque.DistanceMeters)
                    .Take(limit)
                    .ToList();

                if (mosques.Count > 0)
                {
                    return new QueryResult(primaryEndpoint, mosques);
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarning(
                    "Primary Overpass mirror {Endpoint} slow or unreachable ({Message}); trying instant Nominatim fallback",
                    primaryEndpoint, ex.Message);
                lastFailure = ex;
            }
        }

        // Step 2: Instant, highly reliable OpenStreetMap Nominatim fallback (sub-second response)
        try
        {
            var nominatimResult = await QueryNominatimAsync(latitude, longitude, radius, limit, cancellationToken);
            if (nominatimResult.Mosques.Count > 0)
            {
                Logger.LogInformation(
                    "OpenStreetMap Nominatim fallback answered with {Count} mosques around {Lat},{Lon}",
                    nominatimResult.Mosques.Count, latitude, longitude);
                return nominatimResult;
            }
        }
        catch (Exception ex)
        {
            Logger.LogWarning(ex, "OpenStreetMap Nominatim fallback failed: {Message}", ex.Message);
        }

        // Step 3: Try remaining Overpass mirrors if any exist
        for (var index = 1; index < endpoints.Count; index++)
        {
            var endpoint = endpoints[index];
            try
            {
                using var attemptCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                attemptCts.CancelAfter(TimeSpan.FromSeconds(3));

                var response = await PostQueryAsync(endpoint, query, attemptCts.Token);

                var mosques = response.Elements
                    .Select(element => MosqueMapper.Map(element, latitude, longitude))
                    .Where(mosque => mosque is not null)
                    .Select(mosque => mosque!)
                    .OrderBy(mosque => mosque.DistanceMeters)
                    .Take(limit)
                    .ToList();

                if (mosques.Count > 0)
                {
                    Logger.LogInformation(
                        "Overpass backup mirror {Endpoint} answered with {Count} mosques",
                        endpoint, mosques.Count);
                    return new QueryResult(endpoint, mosques);
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarning(
                    "Overpass backup mirror {Endpoint} failed ({Message})",
                    endpoint, ex.Message);
                lastFailure = ex;
            }
        }

        throw new ExternalApiException(
            ServiceName,
            "Every OpenStreetMap mosque server is busy right now. Please try again in a moment.",
            (lastFailure as ExternalApiException)?.UpstreamStatusCode,
            lastFailure);
    }

    private async Task<QueryResult> QueryNominatimAsync(
        double latitude,
        double longitude,
        int radiusMeters,
        int limit,
        CancellationToken cancellationToken)
    {
        // 1 degree latitude ~ 111,000 meters
        var deltaLat = (radiusMeters + 400) / 111_000.0;
        var deltaLon = (radiusMeters + 400) / (111_000.0 * Math.Max(0.1, Math.Cos(latitude * Math.PI / 180.0)));

        var minLat = (latitude - deltaLat).ToString("0.######", CultureInfo.InvariantCulture);
        var maxLat = (latitude + deltaLat).ToString("0.######", CultureInfo.InvariantCulture);
        var minLon = (longitude - deltaLon).ToString("0.######", CultureInfo.InvariantCulture);
        var maxLon = (longitude + deltaLon).ToString("0.######", CultureInfo.InvariantCulture);

        var url = $"search?q=mosque&format=json&addressdetails=1&bounded=1&viewbox={minLon},{maxLat},{maxLon},{minLat}&limit={Math.Max(limit, 30)}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        using var response = await _nominatimClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new ExternalApiException(
                "OpenStreetMap Nominatim",
                $"Nominatim returned HTTP {response.StatusCode}",
                response.StatusCode);
        }

        var places = await response.Content.ReadFromJsonAsync<List<NominatimPlace>>(cancellationToken: cancellationToken);

        var mosques = (places ?? [])
            .Where(IsMosque)
            .Select(p => MapNominatim(p, latitude, longitude))
            .Where(m => m is not null)
            .Select(m => m!)
            .OrderBy(m => m.DistanceMeters)
            .Take(limit)
            .ToList();

        // If 'q=mosque' returned no results, also try 'amenity=place_of_worship'
        if (mosques.Count == 0)
        {
            var amenityUrl = $"search?amenity=place_of_worship&format=json&addressdetails=1&bounded=1&viewbox={minLon},{maxLat},{maxLon},{minLat}&limit={Math.Max(limit, 30)}";
            using var amenityReq = new HttpRequestMessage(HttpMethod.Get, amenityUrl);
            using var amenityResp = await _nominatimClient.SendAsync(amenityReq, cancellationToken);
            if (amenityResp.IsSuccessStatusCode)
            {
                var amenityPlaces = await amenityResp.Content.ReadFromJsonAsync<List<NominatimPlace>>(cancellationToken: cancellationToken);
                mosques = (amenityPlaces ?? [])
                    .Where(IsMosque)
                    .Select(p => MapNominatim(p, latitude, longitude))
                    .Where(m => m is not null)
                    .Select(m => m!)
                    .OrderBy(m => m.DistanceMeters)
                    .Take(limit)
                    .ToList();
            }
        }

        return new QueryResult("OpenStreetMap Nominatim", mosques);
    }

    private static bool IsMosque(NominatimPlace p)
    {
        var text = $"{p.Name} {p.DisplayName} {p.Type} {p.Category}".ToLowerInvariant();
        if (text.Contains("church") || text.Contains("temple") || text.Contains("mandir") ||
            text.Contains("pagoda") || text.Contains("synagogue"))
        {
            return false;
        }

        return text.Contains("mosque") || text.Contains("masjid") || text.Contains("মসজিদ") ||
               text.Contains("jama") || text.Contains("jame") || text.Contains("eidgah") ||
               p.Type == "place_of_worship" || p.Type == "mosque";
    }

    private static MosqueDto? MapNominatim(NominatimPlace place, double centerLat, double centerLon)
    {
        if (!double.TryParse(place.Latitude, CultureInfo.InvariantCulture, out var lat) ||
            !double.TryParse(place.Longitude, CultureInfo.InvariantCulture, out var lon))
        {
            return null;
        }

        var osmType = place.OsmType ?? "node";
        var osmId = place.OsmId ?? place.PlaceId;

        var rawName = place.Name?.Trim();
        var isGeneric = string.IsNullOrWhiteSpace(rawName) ||
                        string.Equals(rawName, "Mosque", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(rawName, "Masjid", StringComparison.OrdinalIgnoreCase);

        string name;
        bool hasName;
        if (!isGeneric)
        {
            name = rawName!;
            hasName = true;
        }
        else
        {
            var locationHint = place.Address?.Road ?? place.Address?.Neighbourhood ?? place.Address?.Suburb;
            name = !string.IsNullOrWhiteSpace(locationHint) ? $"মসজিদ ({locationHint})" : "মসজিদ";
            hasName = false;
        }

        var distance = Math.Round(GeoDistance.Between(centerLat, centerLon, lat, lon), 1);

        return new MosqueDto(
            $"{osmType}/{osmId}",
            name,
            hasName,
            lat,
            lon,
            distance,
            place.DisplayName,
            "sunni",
            null,
            null,
            osmType,
            osmId,
            $"https://www.openstreetmap.org/{osmType}/{osmId}",
            $"https://www.openstreetmap.org/directions?to={lat.ToString("0.######", CultureInfo.InvariantCulture)}%2C{lon.ToString("0.######", CultureInfo.InvariantCulture)}");
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
