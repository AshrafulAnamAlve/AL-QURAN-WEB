using System.Net;
using System.Text.Json;
using Xunit;

namespace AlQuran.Api.Tests.Integration;

public class HealthAndMetaEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthAndMetaEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RootEndpoint_ReturnsHealthyLandingJson()
    {
        var response = await _client.GetAsync("/");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        Assert.Equal("Al-Quran Web API", root.GetProperty("name").GetString());
        Assert.Equal("running", root.GetProperty("status").GetString());
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsLivenessStatus()
    {
        var response = await _client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        Assert.Equal("Healthy", root.GetProperty("status").GetString());
    }

    [Fact]
    public async Task MetaEndpoint_ReturnsApplicationInfoAndApiDirectory()
    {
        var response = await _client.GetAsync("/api/meta");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        Assert.True(root.TryGetProperty("name", out var name));
        Assert.Equal("Al-Quran Web API", name.GetString());
        Assert.True(root.TryGetProperty("externalApis", out var apis));
        Assert.True(apis.GetArrayLength() > 0);
    }
}
