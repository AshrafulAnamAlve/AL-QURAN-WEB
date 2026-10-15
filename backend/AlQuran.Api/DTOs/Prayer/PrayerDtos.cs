using AlQuran.Api.DTOs.Calendar;

namespace AlQuran.Api.DTOs.Prayer;

/// <summary>One entry in a day's timetable.</summary>
/// <param name="Key">Stable identifier, e.g. "fajr".</param>
/// <param name="Name">Display name in English.</param>
/// <param name="ArabicName">Display name in Arabic.</param>
/// <param name="BanglaName">Display name in Bangla.</param>
/// <param name="Time">Local clock time, "HH:mm".</param>
/// <param name="At">
/// The same moment as an absolute instant, including the location's UTC offset.
/// This is what makes an accurate countdown possible without the browser having
/// to guess the target timezone.
/// </param>
/// <param name="IsPrayer">
/// False for entries that are markers rather than prayers - Sunrise, Imsak,
/// Midnight - so the UI can show them without counting them as a salah.
/// </param>
public sealed record PrayerTimeDto(
    string Key,
    string Name,
    string ArabicName,
    string BanglaName,
    string Time,
    DateTimeOffset? At,
    bool IsPrayer);

/// <summary>Where a timetable was calculated for.</summary>
public sealed record PrayerLocationDto(
    double Latitude,
    double Longitude,
    string Timezone,
    string? Place);

/// <summary>Which calculation was used, always shown to the user rather than hidden.</summary>
/// <param name="Id">Aladhan method id.</param>
/// <param name="Name">Method name, e.g. "University of Islamic Sciences, Karachi".</param>
/// <param name="School">"Hanafi" or "Shafi" - this changes the Asr time.</param>
public sealed record CalculationSummaryDto(int Id, string Name, string School);

/// <summary>
/// A full day's prayer timetable.
///
/// Deliberately contains no "current" or "next" prayer: those change every
/// second, and baking them in would make the response impossible to cache. The
/// client derives them from <see cref="PrayerTimeDto.At"/>.
/// </summary>
/// <param name="Date">The Gregorian date these times are for.</param>
/// <param name="ReadableDate">Human readable form of that date.</param>
/// <param name="Hijri">The matching Hijri date.</param>
/// <param name="Location">Where the times were calculated for.</param>
/// <param name="Method">Which calculation was used.</param>
/// <param name="Times">The timetable, in chronological order.</param>
/// <param name="Notice">Why these times may differ from a local announcement.</param>
public sealed record PrayerDayDto(
    DateOnly Date,
    string ReadableDate,
    HijriDateDto? Hijri,
    PrayerLocationDto Location,
    CalculationSummaryDto Method,
    IReadOnlyList<PrayerTimeDto> Times,
    string Notice);

/// <summary>A month of daily timetables.</summary>
/// <param name="Year">Gregorian year.</param>
/// <param name="Month">Gregorian month, 1-12.</param>
/// <param name="Location">Where the times were calculated for.</param>
/// <param name="Method">Which calculation was used.</param>
/// <param name="Days">One entry per day of the month.</param>
/// <param name="Notice">Why these times may differ from a local announcement.</param>
public sealed record PrayerMonthDto(
    int Year,
    int Month,
    PrayerLocationDto Location,
    CalculationSummaryDto Method,
    IReadOnlyList<PrayerDayDto> Days,
    string Notice);

/// <summary>A calculation method the user can choose from.</summary>
/// <param name="Id">Aladhan method id, passed back on later requests.</param>
/// <param name="Code">Short provider code, e.g. "KARACHI".</param>
/// <param name="Name">Full method name.</param>
/// <param name="Parameters">
/// Twilight angles rendered as text, e.g. "Fajr 18, Isha 18". Some methods use
/// a fixed interval instead of an angle, which is why this is a string.
/// </param>
/// <param name="IsDefault">True for the method this API uses when none is given.</param>
public sealed record CalculationMethodDto(
    int Id,
    string Code,
    string Name,
    string Parameters,
    bool IsDefault);
