using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>City search and reverse geocoding (OpenStreetMap Nominatim).</summary>
public sealed class GeocodingApiOptions : ExternalApiOptions
{
    public const string SectionName = "ExternalApis:GeocodingApi";

    /// <summary>
    /// The Nominatim usage policy REQUIRES a descriptive User-Agent that identifies
    /// this application and gives them a way to contact you. Requests without one
    /// get blocked. Put a real contact address here before deploying publicly.
    /// </summary>
    [Required(AllowEmptyStrings = false)]
    public string UserAgent { get; set; } = "AlQuranWeb/1.0";

    /// <summary>Maximum results returned by a city search.</summary>
    [Range(1, 50)]
    public int MaxResults { get; set; } = 8;
}
