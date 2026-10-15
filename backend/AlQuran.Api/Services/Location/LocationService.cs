using System.Globalization;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Location;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.Nominatim;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Location;

/// <summary>
/// City search and reverse geocoding, backed by OpenStreetMap Nominatim.
///
/// Nominatim asks callers for at most one request per second and requires that
/// results be cached rather than re-requested. Both are handled here: results
/// are held for a day, and the client for this provider is configured with
/// minimal retries.
/// </summary>
public sealed class LocationService : ExternalApiClientBase, ILocationService
{
    private readonly ICacheService _cache;
    private readonly GeocodingApiOptions _options;
    private readonly TimeSpan _cacheDuration;

    public LocationService(
        IHttpClientFactory httpClientFactory,
        ILogger<LocationService> logger,
        ICacheService cache,
        IOptions<GeocodingApiOptions> options,
        IOptions<CacheOptions> cacheOptions)
        : base(
            httpClientFactory.CreateClient(ExternalApiRegistry.GeocodingApi),
            logger,
            "OpenStreetMap Nominatim")
    {
        _cache = cache;
        _options = options.Value;
        _cacheDuration = TimeSpan.FromMinutes(cacheOptions.Value.GeocodingMinutes);
    }

    public async Task<IReadOnlyList<PlaceDto>> SearchAsync(
        string query,
        int? limit = null,
        CancellationToken cancellationToken = default)
    {
        var trimmed = (query ?? string.Empty).Trim();

        if (trimmed.Length < 2 || trimmed.Length > 120)
        {
            throw new RequestValidationException(
                "Search text must be between 2 and 120 characters.",
                nameof(query));
        }

        var take = Math.Clamp(limit ?? _options.MaxResults, 1, _options.MaxResults);

        var places = await _cache.GetOrCreateAsync(
            $"geo:search:{trimmed.ToLowerInvariant()}:{take}",
            _cacheDuration,
            async ct =>
            {
                var url = $"search?q={Uri.EscapeDataString(trimmed)}"
                          + $"&format=json&limit={take}&addressdetails=1&accept-language=en";

                return await GetJsonAsync<List<NominatimPlace>>(url, ct);
            },
            cancellationToken);

        return places.Select(Map).Where(place => place is not null).Select(place => place!).ToList();
    }

    public async Task<PlaceDto?> ReverseAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        // Rounded before it is used as a key so a precise position is never stored.
        var key = $"geo:reverse:{Round(latitude)}:{Round(longitude)}";

        var place = await _cache.GetOrCreateAsync<NominatimPlace?>(
            key,
            _cacheDuration,
            async ct =>
            {
                var url = $"reverse?lat={Format(latitude)}&lon={Format(longitude)}"
                          + "&format=json&addressdetails=1&accept-language=en&zoom=12";

                return await GetJsonAsync<NominatimPlace>(url, ct);
            },
            cancellationToken);

        return place is null ? null : Map(place);
    }

    /// <summary>
    /// Maps a Nominatim result. Latitude and longitude arrive as strings and are
    /// parsed with the invariant culture: on a machine with a comma decimal
    /// separator, the default parse would silently produce the wrong coordinate.
    /// </summary>
    private static PlaceDto? Map(NominatimPlace place)
    {
        if (!double.TryParse(place.Latitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat)
            || !double.TryParse(place.Longitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
        {
            return null;
        }

        var address = place.Address;

        return new PlaceDto(
            place.Name ?? place.DisplayName.Split(',')[0].Trim(),
            place.DisplayName,
            lat,
            lon,
            address?.BestLocality,
            address?.State,
            address?.Country,
            address?.CountryCode);
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

    private static string Format(double value) =>
        value.ToString("0.######", CultureInfo.InvariantCulture);
}
