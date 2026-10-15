namespace AlQuran.Api.DTOs.Location;

/// <summary>A place the user can choose as their location.</summary>
/// <param name="Name">Short name, e.g. "Chittagong".</param>
/// <param name="DisplayName">Full name with its administrative context.</param>
/// <param name="Latitude">Latitude in decimal degrees.</param>
/// <param name="Longitude">Longitude in decimal degrees.</param>
/// <param name="City">Best available city-level name.</param>
/// <param name="State">State, division or region.</param>
/// <param name="Country">Country name.</param>
/// <param name="CountryCode">ISO 3166-1 alpha-2 country code, lowercase.</param>
public sealed record PlaceDto(
    string Name,
    string DisplayName,
    double Latitude,
    double Longitude,
    string? City,
    string? State,
    string? Country,
    string? CountryCode);
