using System.Net;
using System.Text.Json;
using Xunit;

namespace AlQuran.Api.Tests.Integration;

public class QuranEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public QuranEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetReciters_Returns200WithVerifiedReciters()
    {
        var response = await _client.GetAsync("/api/quran/reciters");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var reciters = doc.RootElement;

        Assert.True(reciters.GetArrayLength() >= 20);
        Assert.Contains(reciters.EnumerateArray(), r => r.GetProperty("identifier").GetString() == "ar.alafasy");
    }

    [Theory]
    [InlineData("/api/quran/surahs/0")]
    [InlineData("/api/quran/surahs/115")]
    [InlineData("/api/quran/juz/0")]
    [InlineData("/api/quran/juz/31")]
    public async Task InvalidParameters_ReturnProblemDetails400(string path)
    {
        var response = await _client.GetAsync(path);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var problem = doc.RootElement;

        Assert.True(problem.TryGetProperty("status", out var status));
        Assert.Equal(400, status.GetInt32());
        Assert.True(problem.TryGetProperty("errorCode", out _));
    }

    [Fact]
    public async Task Search_WithTooShortQuery_ReturnsBadRequestProblemDetails()
    {
        var response = await _client.GetAsync("/api/quran/search?q=a");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var problem = doc.RootElement;

        Assert.Equal(400, problem.GetProperty("status").GetInt32());
    }
}
