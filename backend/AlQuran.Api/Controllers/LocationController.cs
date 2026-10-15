using AlQuran.Api.DTOs.Location;
using AlQuran.Api.Extensions;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AlQuran.Api.Controllers;

/// <summary>
/// City search and reverse geocoding.
///
/// This is what lets someone who declines location permission still pick their
/// city, which the app treats as a normal choice rather than a degraded one.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class LocationController : ControllerBase
{
    private readonly ILocationService _location;

    public LocationController(ILocationService location)
    {
        _location = location;
    }

    /// <summary>Finds places matching a name.</summary>
    /// <param name="q">What the user typed, at least two characters.</param>
    /// <param name="limit">Maximum results.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The matches, which may be an empty list.</response>
    /// <response code="400">The query is too short or too long.</response>
    /// <response code="429">Too many searches in a short time.</response>
    [HttpGet("search")]
    [EnableRateLimiting(SecurityRegistration.ExpensivePolicy)]
    [ProducesResponseType<IReadOnlyList<PlaceDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<IReadOnlyList<PlaceDto>>> Search(
        [FromQuery] string q,
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
        => Ok(await _location.SearchAsync(q, limit, cancellationToken));

    /// <summary>Names the place at a coordinate.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The place.</response>
    /// <response code="400">A coordinate is out of range.</response>
    /// <response code="404">Nothing was found at that coordinate.</response>
    [HttpGet("reverse")]
    [EnableRateLimiting(SecurityRegistration.ExpensivePolicy)]
    [ProducesResponseType<PlaceDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlaceDto>> Reverse(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        CancellationToken cancellationToken)
    {
        var place = await _location.ReverseAsync(latitude, longitude, cancellationToken);
        return place is null ? NotFound() : Ok(place);
    }
}
