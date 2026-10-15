namespace AlQuran.Api.Services.Mosque;

/// <summary>Great-circle distance between two points on the earth.</summary>
public static class GeoDistance
{
    /// <summary>Mean earth radius in metres, as used by the standard haversine formula.</summary>
    private const double EarthRadiusMeters = 6_371_000;

    /// <summary>
    /// Distance in metres between two coordinates, using the haversine formula.
    ///
    /// This is straight-line distance, not walking or driving distance. It is the
    /// right measure for "which mosque is nearest" and for sorting results, and
    /// the UI presents it as such rather than as a travel distance.
    /// </summary>
    public static double Between(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2))
                * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusMeters * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
