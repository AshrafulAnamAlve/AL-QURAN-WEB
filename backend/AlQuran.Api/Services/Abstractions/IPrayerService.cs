using AlQuran.Api.DTOs.Prayer;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Prayer timetables and Ramadan timings for a location.
///
/// No method here decides which prayer is "next": that changes every second and
/// belongs on the client, which has the absolute instants it needs.
/// </summary>
public interface IPrayerService
{
    /// <summary>A day's timetable for a coordinate.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="date">The day, or null for today.</param>
    /// <param name="method">Aladhan calculation method id, or null for the configured default.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi, or null for the configured default.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<PrayerDayDto> GetTimingsAsync(
        double latitude,
        double longitude,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default);

    /// <summary>A day's timetable for a named city.</summary>
    /// <param name="city">City name, e.g. "Dhaka".</param>
    /// <param name="country">Country name or code, e.g. "Bangladesh".</param>
    /// <param name="date">The day, or null for today.</param>
    /// <param name="method">Aladhan calculation method id, or null for the default.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi, or null for the default.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<PrayerDayDto> GetTimingsByCityAsync(
        string city,
        string country,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default);

    /// <summary>A whole Gregorian month of timetables for a coordinate.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="year">Gregorian year.</param>
    /// <param name="month">Gregorian month, 1-12.</param>
    /// <param name="method">Aladhan calculation method id, or null for the default.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi, or null for the default.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<PrayerMonthDto> GetMonthAsync(
        double latitude,
        double longitude,
        int year,
        int month,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default);

    /// <summary>Ramadan timings for one day: when Suhoor ends and when Iftar begins.</summary>
    /// <param name="latitude">Latitude, -90 to 90.</param>
    /// <param name="longitude">Longitude, -180 to 180.</param>
    /// <param name="date">The day, or null for today.</param>
    /// <param name="method">Aladhan calculation method id, or null for the default.</param>
    /// <param name="school">0 for Shafi, 1 for Hanafi, or null for the default.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<RamadanDayDto> GetRamadanDayAsync(
        double latitude,
        double longitude,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default);

    /// <summary>Every calculation method the user can pick from.</summary>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<IReadOnlyList<CalculationMethodDto>> GetMethodsAsync(
        CancellationToken cancellationToken = default);
}
