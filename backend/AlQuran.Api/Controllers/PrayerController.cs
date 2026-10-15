using AlQuran.Api.DTOs.Prayer;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;

namespace AlQuran.Api.Controllers;

/// <summary>Prayer timetables and Ramadan timings.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class PrayerController : ControllerBase
{
    private readonly IPrayerService _prayer;

    public PrayerController(IPrayerService prayer)
    {
        _prayer = prayer;
    }

    /// <summary>
    /// A day's prayer times for a coordinate.
    ///
    /// Each entry carries both a local "HH:mm" and an absolute instant, so a
    /// countdown stays correct even when the visitor is in another timezone.
    /// The response deliberately does not name the "next" prayer: that changes
    /// every second and is derived on the client.
    /// </summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="date">The day, or omit for today.</param>
    /// <param name="method">Calculation method id. See /api/prayer/methods.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The timetable.</response>
    /// <response code="400">A coordinate or parameter is out of range.</response>
    /// <response code="502">The prayer time provider could not be reached.</response>
    [HttpGet("timings")]
    [ProducesResponseType<PrayerDayDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<PrayerDayDto>> GetTimings(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] DateOnly? date,
        [FromQuery] int? method,
        [FromQuery] int? school,
        CancellationToken cancellationToken)
        => Ok(await _prayer.GetTimingsAsync(latitude, longitude, date, method, school, cancellationToken));

    /// <summary>A day's prayer times for a named city.</summary>
    /// <param name="city">City name, e.g. "Dhaka".</param>
    /// <param name="country">Country name or code, e.g. "Bangladesh".</param>
    /// <param name="date">The day, or omit for today.</param>
    /// <param name="method">Calculation method id.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The timetable.</response>
    /// <response code="400">The city or country is missing or too long.</response>
    [HttpGet("timings/by-city")]
    [ProducesResponseType<PrayerDayDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PrayerDayDto>> GetTimingsByCity(
        [FromQuery] string city,
        [FromQuery] string country,
        [FromQuery] DateOnly? date,
        [FromQuery] int? method,
        [FromQuery] int? school,
        CancellationToken cancellationToken)
        => Ok(await _prayer.GetTimingsByCityAsync(
            city, country, date, method, school, cancellationToken));

    /// <summary>A whole Gregorian month of timetables, for a printable calendar.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="year">Gregorian year.</param>
    /// <param name="month">Gregorian month, 1-12.</param>
    /// <param name="method">Calculation method id.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The month.</response>
    /// <response code="400">A parameter is out of range.</response>
    [HttpGet("calendar")]
    [ProducesResponseType<PrayerMonthDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PrayerMonthDto>> GetMonth(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int? method,
        [FromQuery] int? school,
        CancellationToken cancellationToken)
        => Ok(await _prayer.GetMonthAsync(
            latitude, longitude, year, month, method, school, cancellationToken));

    /// <summary>
    /// Ramadan timings for one day: when Suhoor ends and when the fast is broken.
    /// Returns IsRamadan false outside Ramadan, so the client can decide whether
    /// to show the Ramadan view at all.
    /// </summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="date">The day, or omit for today.</param>
    /// <param name="method">Calculation method id.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The Ramadan view of that day.</response>
    /// <response code="400">A coordinate is out of range.</response>
    [HttpGet("ramadan")]
    [ProducesResponseType<RamadanDayDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RamadanDayDto>> GetRamadanDay(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] DateOnly? date,
        [FromQuery] int? method,
        [FromQuery] int? school,
        CancellationToken cancellationToken)
        => Ok(await _prayer.GetRamadanDayAsync(
            latitude, longitude, date, method, school, cancellationToken));

    /// <summary>
    /// Every calculation method, so the user can choose and always see which one
    /// produced the times they are looking at.
    /// </summary>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The method list.</response>
    [HttpGet("methods")]
    [ProducesResponseType<IReadOnlyList<CalculationMethodDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 86_400, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<IReadOnlyList<CalculationMethodDto>>> GetMethods(
        CancellationToken cancellationToken)
        => Ok(await _prayer.GetMethodsAsync(cancellationToken));
}
