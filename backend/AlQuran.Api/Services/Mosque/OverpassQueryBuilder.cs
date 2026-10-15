using System.Globalization;

namespace AlQuran.Api.Services.Mosque;

/// <summary>Builds the Overpass QL query used to find mosques.</summary>
public static class OverpassQueryBuilder
{
    /// <summary>
    /// Asks for every muslim place of worship within a radius.
    ///
    /// `nwr` matters: a mosque may be mapped as a single point (node), a building
    /// outline (way) or a multipolygon (relation). Querying only nodes would miss
    /// a large share of mosques, including most of the well-mapped large ones.
    /// `out center` makes Overpass compute a single coordinate for ways and
    /// relations so every result has a point to put on the map.
    /// </summary>
    /// <param name="latitude">Centre latitude.</param>
    /// <param name="longitude">Centre longitude.</param>
    /// <param name="radiusMeters">Search radius in metres.</param>
    /// <param name="limit">Maximum elements to return.</param>
    /// <param name="timeoutSeconds">Server-side timeout Overpass should honour.</param>
    public static string Build(
        double latitude,
        double longitude,
        int radiusMeters,
        int limit,
        int timeoutSeconds)
    {
        var lat = latitude.ToString("0.######", CultureInfo.InvariantCulture);
        var lon = longitude.ToString("0.######", CultureInfo.InvariantCulture);

        return $"[out:json][timeout:{timeoutSeconds}];"
               + $"nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"]"
               + $"(around:{radiusMeters},{lat},{lon});"
               + $"out center tags {limit};";
    }
}
