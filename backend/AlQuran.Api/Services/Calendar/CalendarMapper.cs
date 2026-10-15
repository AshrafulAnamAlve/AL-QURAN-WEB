using System.Globalization;
using AlQuran.Api.DTOs.Calendar;
using AlQuran.Api.Models.Upstream.Aladhan;

namespace AlQuran.Api.Services.Calendar;

/// <summary>Turns Aladhan date shapes into this app's calendar DTOs.</summary>
public static class CalendarMapper
{
    /// <summary>Maps a Hijri date, preferring our own month names over the provider's.</summary>
    public static HijriDateDto ToHijri(AladhanHijriDate hijri)
    {
        var monthNumber = hijri.Month?.Number ?? 0;
        var known = monthNumber is >= 1 and <= 12 ? HijriMonths.Get(monthNumber) : null;

        var day = ParseInt(hijri.Day);
        var year = ParseInt(hijri.Year);
        var nameEn = known?.NameEn ?? hijri.Month?.En ?? string.Empty;

        return new HijriDateDto(
            day,
            monthNumber,
            year,
            nameEn,
            known?.NameAr ?? hijri.Month?.Ar ?? string.Empty,
            hijri.Weekday?.En ?? string.Empty,
            hijri.Weekday?.Ar ?? string.Empty,
            hijri.Month?.Days ?? 30,
            $"{day} {nameEn} {year} {hijri.Designation?.Abbreviated ?? "AH"}",
            hijri.Holidays);
    }

    /// <summary>Maps a Gregorian date.</summary>
    public static GregorianDateDto ToGregorian(AladhanGregorianDate gregorian)
    {
        var date = ParseDate(gregorian.Date);

        return new GregorianDateDto(
            date,
            gregorian.Weekday?.En ?? date.DayOfWeek.ToString(),
            gregorian.Month?.En ?? date.ToString("MMMM", CultureInfo.InvariantCulture),
            date.ToString("d MMMM yyyy", CultureInfo.InvariantCulture));
    }

    /// <summary>Aladhan uses "DD-MM-YYYY" throughout, both in and out.</summary>
    public static DateOnly ParseDate(string value) =>
        DateOnly.TryParseExact(value, "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date
            : DateOnly.FromDateTime(DateTime.UtcNow);

    /// <summary>Formats a date the way Aladhan expects it in a URL.</summary>
    public static string FormatDate(DateOnly date) =>
        date.ToString("dd-MM-yyyy", CultureInfo.InvariantCulture);

    private static int ParseInt(string value) =>
        int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) ? parsed : 0;
}
