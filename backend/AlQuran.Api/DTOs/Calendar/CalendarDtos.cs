namespace AlQuran.Api.DTOs.Calendar;

/// <summary>A Hijri date.</summary>
/// <param name="Day">Day of the Hijri month, 1-30.</param>
/// <param name="Month">Hijri month number, 1-12.</param>
/// <param name="Year">Hijri year.</param>
/// <param name="MonthNameEn">Transliterated month name, e.g. "Rabi al-awwal".</param>
/// <param name="MonthNameAr">Arabic month name.</param>
/// <param name="WeekdayEn">Weekday name in English.</param>
/// <param name="WeekdayAr">Weekday name in Arabic.</param>
/// <param name="MonthLength">Length of this Hijri month, 29 or 30 days.</param>
/// <param name="Formatted">Ready-to-display string, e.g. "22 Rabi al-awwal 1448 AH".</param>
/// <param name="Holidays">Observances the provider recognises on this date.</param>
public sealed record HijriDateDto(
    int Day,
    int Month,
    int Year,
    string MonthNameEn,
    string MonthNameAr,
    string WeekdayEn,
    string WeekdayAr,
    int MonthLength,
    string Formatted,
    IReadOnlyList<string> Holidays);

/// <summary>A Gregorian date.</summary>
/// <param name="Date">The date itself.</param>
/// <param name="WeekdayEn">Weekday name in English.</param>
/// <param name="MonthNameEn">Month name in English.</param>
/// <param name="Formatted">Ready-to-display string, e.g. "4 September 2026".</param>
public sealed record GregorianDateDto(
    DateOnly Date,
    string WeekdayEn,
    string MonthNameEn,
    string Formatted);

/// <summary>The same day expressed in both calendars.</summary>
/// <param name="Hijri">The Hijri date.</param>
/// <param name="Gregorian">The Gregorian date.</param>
/// <param name="Notice">Why this Hijri date may differ from a local announcement.</param>
public sealed record DateConversionDto(
    HijriDateDto Hijri,
    GregorianDateDto Gregorian,
    string Notice);

/// <summary>One day inside a Hijri month grid.</summary>
/// <param name="HijriDay">Day of the Hijri month.</param>
/// <param name="GregorianDate">The matching Gregorian date.</param>
/// <param name="WeekdayEn">Weekday name in English.</param>
/// <param name="IsToday">True when this is the current day.</param>
/// <param name="Events">Islamic events falling on this day.</param>
public sealed record HijriDayDto(
    int HijriDay,
    DateOnly GregorianDate,
    string WeekdayEn,
    bool IsToday,
    IReadOnlyList<string> Events);

/// <summary>A whole Hijri month, day by day.</summary>
/// <param name="Year">Hijri year.</param>
/// <param name="Month">Hijri month number, 1-12.</param>
/// <param name="NameEn">Transliterated month name.</param>
/// <param name="NameAr">Arabic month name.</param>
/// <param name="Length">Number of days in the month.</param>
/// <param name="Days">Each day, with its Gregorian counterpart.</param>
/// <param name="Notice">Why these dates may differ from a local announcement.</param>
public sealed record HijriMonthDto(
    int Year,
    int Month,
    string NameEn,
    string NameAr,
    int Length,
    IReadOnlyList<HijriDayDto> Days,
    string Notice);

/// <summary>A named Islamic date in a given Hijri year.</summary>
/// <param name="Key">Stable identifier, e.g. "ashura".</param>
/// <param name="Name">Name in English.</param>
/// <param name="BanglaName">Name in Bangla.</param>
/// <param name="HijriDay">Day of the Hijri month it falls on.</param>
/// <param name="HijriMonth">Hijri month number it falls in.</param>
/// <param name="HijriMonthName">Transliterated name of that month.</param>
/// <param name="GregorianDate">The calculated Gregorian date, when it could be resolved.</param>
/// <param name="Description">One line explaining the day.</param>
/// <param name="IsRange">
/// True for observances that span several nights rather than one fixed day,
/// such as the odd nights on which Laylat al-Qadr is sought.
/// </param>
public sealed record IslamicEventDto(
    string Key,
    string Name,
    string BanglaName,
    int HijriDay,
    int HijriMonth,
    string HijriMonthName,
    DateOnly? GregorianDate,
    string Description,
    bool IsRange);

/// <summary>The Islamic events of one Hijri year.</summary>
/// <param name="HijriYear">The year the events were resolved for.</param>
/// <param name="Events">The events, in Hijri calendar order.</param>
/// <param name="Notice">Why these dates are approximate.</param>
public sealed record IslamicEventsDto(
    int HijriYear,
    IReadOnlyList<IslamicEventDto> Events,
    string Notice);

/// <summary>A Hijri month in the reference list of twelve.</summary>
public sealed record HijriMonthNameDto(int Number, string NameEn, string NameAr, string BanglaName);
