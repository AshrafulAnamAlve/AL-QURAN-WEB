using AlQuran.Api.DTOs.Location;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Turns place names into coordinates and back.
///
/// This exists so a user who declines location permission can still pick their
/// city by name, which the app treats as a first-class option rather than a
/// fallback.
/// </summary>
public interface ILocationService
{
    /// <summary>Finds places matching a name.</summary>
    /// <param name="query">What the user typed, e.g. "Chittagong".</param>
    /// <param name="limit">Maximum results to return.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<IReadOnlyList<PlaceDto>> SearchAsync(
        string query,
        int? limit = null,
        CancellationToken cancellationToken = default);

    /// <summary>Names the place at a coordinate, or null if nothing was found.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<PlaceDto?> ReverseAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default);
}
