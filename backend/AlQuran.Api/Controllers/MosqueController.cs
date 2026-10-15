using AlQuran.Api.DTOs.Mosque;
using AlQuran.Api.Extensions;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AlQuran.Api.Controllers;

/// <summary>Nearby mosques, from OpenStreetMap data.</summary>
[ApiController]
[Route("api/mosques")]
[Produces("application/json")]
public sealed class MosqueController : ControllerBase
{
    private readonly IMosqueService _mosques;

    public MosqueController(IMosqueService mosques)
    {
        _mosques = mosques;
    }

    /// <summary>
    /// Mosques within a radius of a coordinate, nearest first.
    ///
    /// Rate limited more tightly than the rest of the API: the Overpass servers
    /// behind it are donated infrastructure and go busy under load.
    /// </summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="radius">Search radius in metres, 100 to 50000.</param>
    /// <param name="limit">Maximum results.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The matches, which may be an empty list.</response>
    /// <response code="400">A coordinate is out of range.</response>
    /// <response code="429">Too many searches in a short time.</response>
    /// <response code="502">Every Overpass endpoint was unreachable.</response>
    [HttpGet]
    [EnableRateLimiting(SecurityRegistration.ExpensivePolicy)]
    [ProducesResponseType<MosqueSearchDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<MosqueSearchDto>> FindNearby(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] int? radius,
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
        => Ok(await _mosques.FindNearbyAsync(latitude, longitude, radius, limit, cancellationToken));
}
