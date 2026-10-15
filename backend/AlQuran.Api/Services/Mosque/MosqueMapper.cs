using System.Globalization;
using AlQuran.Api.DTOs.Mosque;
using AlQuran.Api.Models.Upstream.Overpass;

namespace AlQuran.Api.Services.Mosque;

/// <summary>Turns raw OSM elements into mosque DTOs.</summary>
public static class MosqueMapper
{
    /// <summary>Shown when an element carries no name tag, which is common.</summary>
    public const string UnnamedLabel = "Unnamed mosque";

    /// <summary>
    /// Maps one element, or null when it has no usable coordinate.
    /// </summary>
    /// <param name="element">The OSM element.</param>
    /// <param name="fromLatitude">Latitude the search was centred on.</param>
    /// <param name="fromLongitude">Longitude the search was centred on.</param>
    public static MosqueDto? Map(
        OverpassElement element,
        double fromLatitude,
        double fromLongitude)
    {
        var lat = element.ResolvedLat;
        var lon = element.ResolvedLon;

        if (lat is null || lon is null)
        {
            return null;
        }

        var tags = element.Tags ?? [];
        var name = FirstTag(tags, "name:en", "name", "official_name", "alt_name");
        var distance = GeoDistance.Between(fromLatitude, fromLongitude, lat.Value, lon.Value);

        return new MosqueDto(
            $"{element.Type}/{element.Id}",
            name ?? UnnamedLabel,
            name is not null,
            lat.Value,
            lon.Value,
            Math.Round(distance, 1),
            BuildAddress(tags),
            tags.GetValueOrDefault("denomination"),
            FirstTag(tags, "website", "contact:website"),
            FirstTag(tags, "phone", "contact:phone"),
            element.Type,
            element.Id,
            $"https://www.openstreetmap.org/{element.Type}/{element.Id}",
            BuildDirectionsUrl(lat.Value, lon.Value));
    }

    /// <summary>
    /// Assembles a street address from whichever address tags exist.
    /// OpenStreetMap tagging is sparse and inconsistent, so this returns null
    /// rather than a half-empty string when there is nothing useful to show.
    /// </summary>
    private static string? BuildAddress(IReadOnlyDictionary<string, string> tags)
    {
        var parts = new[]
            {
                Join(tags.GetValueOrDefault("addr:housenumber"), tags.GetValueOrDefault("addr:street")),
                tags.GetValueOrDefault("addr:suburb"),
                tags.GetValueOrDefault("addr:city"),
                tags.GetValueOrDefault("addr:postcode"),
            }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .ToList();

        return parts.Count > 0 ? string.Join(", ", parts) : null;
    }

    private static string? Join(string? houseNumber, string? street)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            return null;
        }

        return string.IsNullOrWhiteSpace(houseNumber) ? street : $"{houseNumber} {street}";
    }

    /// <summary>
    /// A geo: URI opens the visitor's own map application on Android and iOS and
    /// falls back to a web map on desktop, which keeps us off any paid service.
    /// </summary>
    private static string BuildDirectionsUrl(double latitude, double longitude)
    {
        var lat = latitude.ToString("0.######", CultureInfo.InvariantCulture);
        var lon = longitude.ToString("0.######", CultureInfo.InvariantCulture);

        return $"https://www.openstreetmap.org/directions?to={lat}%2C{lon}";
    }

    private static string? FirstTag(IReadOnlyDictionary<string, string> tags, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (tags.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
            {
                return value.Trim();
            }
        }

        return null;
    }
}
