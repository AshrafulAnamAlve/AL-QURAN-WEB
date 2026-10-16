using System.Net;
using System.Text.Json;
using Xunit;

namespace AlQuran.Api.Tests.Integration;

public class PrayerAndCalendarEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PrayerAndCalendarEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMonths_Returns12HijriMonthsWithBanglaNames()
    {
        var response = await _client.GetAsync("/api/calendar/months");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var months = doc.RootElement;

        Assert.Equal(12, months.GetArrayLength());
        Assert.Contains(months.EnumerateArray(), m => m.GetProperty("number").GetInt32() == 9 && m.GetProperty("nameEn").GetString() == "Ramadan");
    }

    [Theory]
    [InlineData("/api/prayer/timings?latitude=95&longitude=90")]
    [InlineData("/api/prayer/timings?latitude=23&longitude=200")]
    [InlineData("/api/calendar/to-gregorian?day=40&month=1&year=1448")]
    [InlineData("/api/calendar/to-gregorian?day=1&month=13&year=1448")]
    [InlineData("/api/mosques?latitude=100&longitude=0")]
    [InlineData("/api/mosques?latitude=0&longitude=200")]
    [InlineData("/api/location/search?q=a")]
    public async Task InvalidQueries_ReturnProblemDetails400(string path)
    {
        var response = await _client.GetAsync(path);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var problem = doc.RootElement;

        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.True(problem.TryGetProperty("errorCode", out _));
    }
}
