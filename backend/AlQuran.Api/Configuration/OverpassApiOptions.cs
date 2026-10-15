using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>Nearby mosque lookup over OpenStreetMap data (Overpass API).</summary>
public sealed class OverpassApiOptions : ExternalApiOptions
{
    public const string SectionName = "ExternalApis:OverpassApi";

    /// <summary>
    /// Public Overpass instances are volunteer run and go busy without warning
    /// (we hit exactly that while verifying the API), so we keep mirrors and fail over.
    /// </summary>
    public IList<string> MirrorUrls { get; set; } = [];

    /// <summary>Default search radius in metres.</summary>
    [Range(100, 50000)]
    public int DefaultRadiusMeters { get; set; } = 3000;

    /// <summary>Hard cap on results, to keep responses small on mobile.</summary>
    [Range(1, 200)]
    public int MaxResults { get; set; } = 60;

    /// <summary>Primary endpoint first, then every configured mirror.</summary>
    public IReadOnlyList<string> AllEndpoints =>
        new[] { BaseUrl }
            .Concat(MirrorUrls)
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .ToList();
}
