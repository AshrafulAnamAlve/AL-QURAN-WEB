using AlQuran.Api.DTOs.Calendar;

namespace AlQuran.Api.DTOs.Prayer;

/// <summary>Ramadan-specific view of a single day.</summary>
/// <param name="Date">The Gregorian date.</param>
/// <param name="RamadanDay">Day of Ramadan, 1-30, or null outside Ramadan.</param>
/// <param name="IsRamadan">Whether this date falls in Ramadan.</param>
/// <param name="SuhoorEndsAt">When Suhoor ends (Imsak), as an absolute instant.</param>
/// <param name="SuhoorEndsTime">The same, as local "HH:mm".</param>
/// <param name="IftarAt">When the fast is broken (Maghrib), as an absolute instant.</param>
/// <param name="IftarTime">The same, as local "HH:mm".</param>
/// <param name="Hijri">The Hijri date.</param>
/// <param name="Location">Where the times were calculated for.</param>
/// <param name="Method">Which calculation was used.</param>
/// <param name="Notice">Why these times may differ from a local announcement.</param>
public sealed record RamadanDayDto(
    DateOnly Date,
    int? RamadanDay,
    bool IsRamadan,
    DateTimeOffset? SuhoorEndsAt,
    string? SuhoorEndsTime,
    DateTimeOffset? IftarAt,
    string? IftarTime,
    HijriDateDto? Hijri,
    PrayerLocationDto Location,
    CalculationSummaryDto Method,
    string Notice);
