using AlQuran.Api.Services.Mosque;
using Xunit;

namespace AlQuran.Api.Tests.Unit;

public class OverpassQueryBuilderTests
{
    [Fact]
    public void Build_GeneratesCorrectOverpassQl()
    {
        var query = OverpassQueryBuilder.Build(
            latitude: 23.8103,
            longitude: 90.4125,
            radiusMeters: 2000,
            limit: 50,
            timeoutSeconds: 25);

        Assert.Contains("[out:json][timeout:25];", query);
        Assert.Contains("nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"]", query);
        Assert.Contains("(around:2000,23.8103,90.4125);", query);
        Assert.Contains("out center tags 50;", query);
    }
}
