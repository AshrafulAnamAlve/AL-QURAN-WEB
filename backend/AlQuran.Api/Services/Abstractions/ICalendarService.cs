using AlQuran.Api.DTOs.Calendar;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Hijri calendar conversions and the Islamic events of a year.
///
/// Every value this returns is calculated. Responses carry a notice saying so,
/// because a calculated Hijri date is not the same as one announced after local
/// moon sighting.
/// </summary>
public interface ICalendarService
{
    /// <summary>The Hijri date matching a Gregorian date.</summary>
    Task<DateConversionDto> ToHijriAsync(DateOnly date, CancellationToken cancellationToken = default);

    /// <summary>The Gregorian date matching a Hijri date.</summary>
    Task<DateConversionDto> ToGregorianAsync(
        int day,
        int month,
        int year,
        CancellationToken cancellationToken = default);

    /// <summary>A whole Hijri month, day by day, with its Gregorian counterparts.</summary>
    Task<HijriMonthDto> GetHijriMonthAsync(
        int year,
        int month,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Islamic observances for a Hijri year, each resolved to a Gregorian date.
    /// </summary>
    /// <param name="hijriYear">The Hijri year, or null for the current one.</param>
    /// <param name="cancellationToken">Cancels the upstream requests.</param>
    Task<IslamicEventsDto> GetEventsAsync(
        int? hijriYear = null,
        CancellationToken cancellationToken = default);

    /// <summary>The twelve Hijri months. Static data, no network call.</summary>
    IReadOnlyList<HijriMonthNameDto> GetMonths();
}
