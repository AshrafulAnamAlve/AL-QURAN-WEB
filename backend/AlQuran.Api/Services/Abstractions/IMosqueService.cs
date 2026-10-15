using AlQuran.Api.DTOs.Mosque;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>Finds mosques near a point, using open OpenStreetMap data.</summary>
public interface IMosqueService
{
    /// <summary>Mosques within a radius of a coordinate, nearest first.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="radiusMeters">Search radius, or null for the configured default.</param>
    /// <param name="limit">Maximum results, or null for the configured cap.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<MosqueSearchDto> FindNearbyAsync(
        double latitude,
        double longitude,
        int? radiusMeters = null,
        int? limit = null,
        CancellationToken cancellationToken = default);
}
