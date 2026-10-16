using AlQuran.Api.Services.Mosque;
using Xunit;

namespace AlQuran.Api.Tests.Unit;

public class GeoDistanceTests
{
    [Fact]
    public void Between_SameCoordinates_ReturnsZero()
    {
        var distance = GeoDistance.Between(23.8103, 90.4125, 23.8103, 90.4125);
        Assert.Equal(0, distance, precision: 1);
    }

    [Fact]
    public void Between_KnownLocations_ReturnsAccurateDistance()
    {
        // Makkah (21.4225, 39.8262) to Madinah (24.4672, 39.6111) is ~340 km
        var distanceMeters = GeoDistance.Between(21.4225, 39.8262, 24.4672, 39.6111);
        var distanceKm = distanceMeters / 1000.0;

        Assert.InRange(distanceKm, 330.0, 350.0);
    }

    [Fact]
    public void Between_IsSymmetric()
    {
        var d1 = GeoDistance.Between(23.8103, 90.4125, 22.3569, 91.7832);
        var d2 = GeoDistance.Between(22.3569, 91.7832, 23.8103, 90.4125);

        Assert.Equal(d1, d2, precision: 4);
    }
}
