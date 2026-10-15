using AlQuran.Api.DTOs.Calendar;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;

namespace AlQuran.Api.Controllers;

/// <summary>
/// Hijri calendar conversions and Islamic observances.
///
/// Every date here is calculated astronomically. Each response carries a notice
/// saying so, because a calculated date is not the same as one announced after
/// local moon sighting.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendar;

    public CalendarController(ICalendarService calendar)
    {
        _calendar = calendar;
    }

    /// <summary>Today's date in both calendars.</summary>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The current Hijri and Gregorian date.</response>
    [HttpGet("today")]
    [ProducesResponseType<DateConversionDto>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 3_600, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<DateConversionDto>> GetToday(CancellationToken cancellationToken)
        => Ok(await _calendar.ToHijriAsync(DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken));

    /// <summary>Converts a Gregorian date to Hijri.</summary>
    /// <param name="date">The Gregorian date.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The matching Hijri date.</response>
    [HttpGet("to-hijri")]
    [ProducesResponseType<DateConversionDto>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 86_400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["date"])]
    public async Task<ActionResult<DateConversionDto>> ToHijri(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
        => Ok(await _calendar.ToHijriAsync(date, cancellationToken));

    /// <summary>Converts a Hijri date to Gregorian.</summary>
    /// <param name="day">Hijri day, 1-30.</param>
    /// <param name="month">Hijri month, 1-12.</param>
    /// <param name="year">Hijri year.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The matching Gregorian date.</response>
    /// <response code="400">The Hijri date is out of range.</response>
    [HttpGet("to-gregorian")]
    [ProducesResponseType<DateConversionDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = 86_400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["day", "month", "year"])]
    public async Task<ActionResult<DateConversionDto>> ToGregorian(
        [FromQuery] int day,
        [FromQuery] int month,
        [FromQuery] int year,
        CancellationToken cancellationToken)
        => Ok(await _calendar.ToGregorianAsync(day, month, year, cancellationToken));

    /// <summary>A whole Hijri month, with each day's Gregorian counterpart and events.</summary>
    /// <param name="year">Hijri year.</param>
    /// <param name="month">Hijri month, 1-12.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The month grid.</response>
    /// <response code="400">The month or year is out of range.</response>
    [HttpGet("hijri/{year:int}/{month:int}")]
    [ProducesResponseType<HijriMonthDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = 86_400, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<HijriMonthDto>> GetHijriMonth(
        int year,
        int month,
        CancellationToken cancellationToken)
        => Ok(await _calendar.GetHijriMonthAsync(year, month, cancellationToken));

    /// <summary>The twelve Hijri months, in Arabic, English and Bangla.</summary>
    /// <response code="200">The month names.</response>
    [HttpGet("months")]
    [ProducesResponseType<IReadOnlyList<HijriMonthNameDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 604_800, Location = ResponseCacheLocation.Any)]
    public ActionResult<IReadOnlyList<HijriMonthNameDto>> GetMonths()
        => Ok(_calendar.GetMonths());

    /// <summary>
    /// Islamic observances for a Hijri year, each resolved to a Gregorian date.
    /// These are approximate and labelled as such.
    /// </summary>
    /// <param name="year">Hijri year, or omit for the current one.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The events.</response>
    /// <response code="400">The year is out of range.</response>
    [HttpGet("events")]
    [ProducesResponseType<IslamicEventsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = 86_400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["year"])]
    public async Task<ActionResult<IslamicEventsDto>> GetEvents(
        [FromQuery] int? year,
        CancellationToken cancellationToken)
        => Ok(await _calendar.GetEventsAsync(year, cancellationToken));
}
