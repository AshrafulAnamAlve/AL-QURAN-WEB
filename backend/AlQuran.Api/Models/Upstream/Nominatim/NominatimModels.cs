using System.Text.Json.Serialization;

namespace AlQuran.Api.Models.Upstream.Nominatim;

/// <summary>
/// One place from Nominatim /search or /reverse.
/// Nominatim uses snake_case, so the JsonPropertyName attributes are required -
/// the default camelCase matching would leave these properties empty.
/// </summary>
public sealed class NominatimPlace
{
    [JsonPropertyName("place_id")]
    public long PlaceId { get; set; }

    [JsonPropertyName("osm_type")]
    public string? OsmType { get; set; }

    [JsonPropertyName("osm_id")]
    public long? OsmId { get; set; }

    /// <summary>Latitude, sent as a string by the provider.</summary>
    [JsonPropertyName("lat")]
    public string Latitude { get; set; } = string.Empty;

    /// <summary>Longitude, sent as a string by the provider.</summary>
    [JsonPropertyName("lon")]
    public string Longitude { get; set; } = string.Empty;

    /// <summary>Short name, e.g. "Dhaka".</summary>
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    /// <summary>Full comma-separated name, e.g. "Dhaka, Dhaka District, Bangladesh".</summary>
    [JsonPropertyName("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>OSM class, e.g. "place" or "boundary". `class` is a C# keyword.</summary>
    [JsonPropertyName("class")]
    public string? Category { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("addresstype")]
    public string? AddressType { get; set; }

    /// <summary>Relevance score the provider assigns, 0 to 1.</summary>
    [JsonPropertyName("importance")]
    public double? Importance { get; set; }

    [JsonPropertyName("address")]
    public NominatimAddress? Address { get; set; }
}

/// <summary>Structured address parts. Every field is optional in practice.</summary>
public sealed class NominatimAddress
{
    [JsonPropertyName("road")]
    public string? Road { get; set; }

    [JsonPropertyName("neighbourhood")]
    public string? Neighbourhood { get; set; }

    [JsonPropertyName("suburb")]
    public string? Suburb { get; set; }

    [JsonPropertyName("city")]
    public string? City { get; set; }

    [JsonPropertyName("town")]
    public string? Town { get; set; }

    [JsonPropertyName("village")]
    public string? Village { get; set; }

    [JsonPropertyName("municipality")]
    public string? Municipality { get; set; }

    [JsonPropertyName("county")]
    public string? County { get; set; }

    [JsonPropertyName("state_district")]
    public string? StateDistrict { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("postcode")]
    public string? Postcode { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("country_code")]
    public string? CountryCode { get; set; }

    /// <summary>Best available city-level name, whatever the provider called it.</summary>
    public string? BestLocality =>
        City ?? Town ?? Village ?? Municipality ?? County ?? StateDistrict ?? State;
}
