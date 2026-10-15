using System.Globalization;
using System.Text.Json;
using AlQuran.Api.DTOs.Prayer;
using AlQuran.Api.Models.Upstream.Aladhan;

namespace AlQuran.Api.Services.Prayer;

/// <summary>Turns Aladhan timing shapes into this app's prayer DTOs.</summary>
public static class PrayerMapper
{
    /// <summary>
    /// Converts a local clock time into an absolute instant.
    ///
    /// This is the single most useful thing the backend does for the countdown:
    /// the browser is often in a different timezone from the location being
    /// displayed, and "18:13 in Asia/Dhaka" is meaningless to it without an
    /// offset. Returns null rather than guessing when the zone is unknown or the
    /// local time does not exist because of a daylight-saving jump.
    /// </summary>
    /// <param name="date">The day the time belongs to.</param>
    /// <param name="time">Local time as "HH:mm". A trailing zone suffix is ignored.</param>
    /// <param name="timezoneId">IANA zone id, e.g. "Asia/Dhaka".</param>
    public static DateTimeOffset? ToInstant(DateOnly date, string? time, string? timezoneId)
    {
        if (string.IsNullOrWhiteSpace(time))
        {
            return null;
        }

        // Aladhan usually sends "18:13" but has been known to append "(+06)".
        var clean = time.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();

        if (clean is null
            || !TimeOnly.TryParseExact(clean, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return null;
        }

        var zone = FindTimeZone(timezoneId);

        if (zone is null)
        {
            return null;
        }

        var local = date.ToDateTime(parsed, DateTimeKind.Unspecified);

        // A local time inside a spring-forward gap simply does not exist.
        if (zone.IsInvalidTime(local))
        {
            return null;
        }

        return new DateTimeOffset(local, zone.GetUtcOffset(local));
    }

    /// <summary>
    /// Looks up an IANA zone. .NET resolves IANA ids on Windows too as long as
    /// full ICU data is available, which is why InvariantGlobalization is off.
    /// </summary>
    public static TimeZoneInfo? FindTimeZone(string? timezoneId)
    {
        if (string.IsNullOrWhiteSpace(timezoneId))
        {
            return null;
        }

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
        }
        catch (Exception ex) when (ex is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return null;
        }
    }

    /// <summary>Builds the ordered timetable from the provider's key/value map.</summary>
    public static IReadOnlyList<PrayerTimeDto> ToTimes(
        AladhanTimingsData data,
        DateOnly date,
        string? timezoneId)
    {
        var times = new List<PrayerTimeDto>(PrayerNames.All.Count);

        foreach (var entry in PrayerNames.All)
        {
            if (!data.Timings.TryGetValue(entry.UpstreamKey, out var raw) || string.IsNullOrWhiteSpace(raw))
            {
                continue;
            }

            var clean = raw.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? raw;

            times.Add(new PrayerTimeDto(
                entry.Key,
                entry.Name,
                entry.ArabicName,
                entry.BanglaName,
                clean,
                ToInstant(date, raw, timezoneId),
                entry.IsPrayer));
        }

        return times;
    }

    /// <summary>Describes the calculation that produced a timetable.</summary>
    public static CalculationSummaryDto ToSummary(AladhanMeta? meta, int fallbackMethodId, int fallbackSchool)
    {
        var school = meta?.School;

        var schoolName = string.IsNullOrWhiteSpace(school)
            ? (fallbackSchool == 1 ? "Hanafi" : "Shafi")
            : CultureInfo.InvariantCulture.TextInfo.ToTitleCase(school.ToLowerInvariant());

        return new CalculationSummaryDto(
            meta?.Method?.Id ?? fallbackMethodId,
            meta?.Method?.Name ?? "Unknown method",
            schoolName);
    }

    /// <summary>
    /// Renders a method's twilight parameters as readable text. The values are
    /// usually numbers but can be strings such as "90 min", which is why the
    /// upstream model keeps them as raw JSON.
    /// </summary>
    public static string FormatParameters(Dictionary<string, JsonElement>? parameters)
    {
        if (parameters is null || parameters.Count == 0)
        {
            return string.Empty;
        }

        var parts = parameters.Select(pair =>
        {
            var value = pair.Value.ValueKind switch
            {
                JsonValueKind.String => pair.Value.GetString() ?? string.Empty,
                JsonValueKind.Number => pair.Value.GetDouble().ToString("0.##", CultureInfo.InvariantCulture),
                _ => pair.Value.ToString(),
            };

            return $"{pair.Key} {value}";
        });

        return string.Join(", ", parts);
    }
}
