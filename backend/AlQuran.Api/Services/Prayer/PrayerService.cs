using System.Globalization;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Prayer;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.Aladhan;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Calendar;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Prayer;

/// <summary>
/// Prayer timetables, backed by the Aladhan API.
///
/// Coordinates are rounded before they are used in a cache key, so a precise
/// position is never stored anywhere - two people a few hundred metres apart
/// share the same cached timetable, which is both more private and more
/// efficient.
/// </summary>
public sealed class PrayerService : ExternalApiClientBase, IPrayerService
{
    /// <summary>
    /// Decimal places kept in cache keys. Two places is roughly 1.1 km, which is
    /// far finer than prayer times vary and coarse enough not to identify anyone.
    /// </summary>
    private const int CoordinatePrecision = 2;

    private readonly ICacheService _cache;
    private readonly PrayerApiOptions _options;
    private readonly TimeSpan _cacheDuration;

    public PrayerService(
        IHttpClientFactory httpClientFactory,
        ILogger<PrayerService> logger,
        ICacheService cache,
        IOptions<PrayerApiOptions> options,
        IOptions<CacheOptions> cacheOptions)
        : base(httpClientFactory.CreateClient(ExternalApiRegistry.PrayerApi), logger, "Aladhan")
    {
        _cache = cache;
        _options = options.Value;
        _cacheDuration = TimeSpan.FromMinutes(cacheOptions.Value.PrayerMinutes);
    }

    public async Task<PrayerDayDto> GetTimingsAsync(
        double latitude,
        double longitude,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        var day = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var (methodId, schoolId) = ResolveCalculation(method, school);

        var data = await _cache.GetOrCreateAsync(
            $"prayer:day:{Round(latitude)}:{Round(longitude)}:{day:yyyy-MM-dd}:{methodId}:{schoolId}",
            _cacheDuration,
            async ct =>
            {
                var url = $"timings/{CalendarMapper.FormatDate(day)}"
                          + $"?latitude={Format(latitude)}&longitude={Format(longitude)}"
                          + $"&method={methodId}&school={schoolId}";

                var response = await GetJsonAsync<AladhanEnvelope<AladhanTimingsData>>(url, ct);
                return Require(response.Data, $"prayer times for {day:yyyy-MM-dd}");
            },
            cancellationToken);

        return BuildDay(data, methodId, schoolId, null);
    }

    public async Task<PrayerDayDto> GetTimingsByCityAsync(
        string city,
        string country,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default)
    {
        var cleanCity = RequireText(city, nameof(city));
        var cleanCountry = RequireText(country, nameof(country));

        var day = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var (methodId, schoolId) = ResolveCalculation(method, school);

        var data = await _cache.GetOrCreateAsync(
            $"prayer:city:{cleanCity.ToLowerInvariant()}:{cleanCountry.ToLowerInvariant()}"
            + $":{day:yyyy-MM-dd}:{methodId}:{schoolId}",
            _cacheDuration,
            async ct =>
            {
                var url = $"timingsByCity/{CalendarMapper.FormatDate(day)}"
                          + $"?city={Uri.EscapeDataString(cleanCity)}"
                          + $"&country={Uri.EscapeDataString(cleanCountry)}"
                          + $"&method={methodId}&school={schoolId}";

                var response = await GetJsonAsync<AladhanEnvelope<AladhanTimingsData>>(url, ct);
                return Require(response.Data, $"prayer times for {cleanCity}");
            },
            cancellationToken);

        return BuildDay(data, methodId, schoolId, $"{cleanCity}, {cleanCountry}");
    }

    public async Task<PrayerMonthDto> GetMonthAsync(
        double latitude,
        double longitude,
        int year,
        int month,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        if (month < 1 || month > 12)
        {
            throw new RequestValidationException("Month must be between 1 and 12.", nameof(month));
        }

        if (year < 1900 || year > 2200)
        {
            throw new RequestValidationException("Year must be between 1900 and 2200.", nameof(year));
        }

        var (methodId, schoolId) = ResolveCalculation(method, school);

        var days = await _cache.GetOrCreateAsync(
            $"prayer:month:{Round(latitude)}:{Round(longitude)}:{year}-{month:D2}:{methodId}:{schoolId}",
            _cacheDuration,
            async ct =>
            {
                var url = $"calendar/{year}/{month}"
                          + $"?latitude={Format(latitude)}&longitude={Format(longitude)}"
                          + $"&method={methodId}&school={schoolId}";

                var response = await GetJsonAsync<AladhanEnvelope<List<AladhanTimingsData>>>(url, ct);
                return Require(response.Data, $"the timetable for {month}/{year}");
            },
            cancellationToken);

        var mapped = days.Select(day => BuildDay(day, methodId, schoolId, null)).ToList();

        var location = mapped.Count > 0
            ? mapped[0].Location
            : new PrayerLocationDto(latitude, longitude, string.Empty, null);

        var summary = mapped.Count > 0
            ? mapped[0].Method
            : new CalculationSummaryDto(methodId, "Unknown method", schoolId == 1 ? "Hanafi" : "Shafi");

        return new PrayerMonthDto(
            year, month, location, summary, mapped, ContentNotices.PrayerCalculated);
    }

    public async Task<RamadanDayDto> GetRamadanDayAsync(
        double latitude,
        double longitude,
        DateOnly? date = null,
        int? method = null,
        int? school = null,
        CancellationToken cancellationToken = default)
    {
        var day = await GetTimingsAsync(latitude, longitude, date, method, school, cancellationToken);

        var isRamadan = day.Hijri?.Month == HijriMonths.RamadanNumber;
        var suhoor = day.Times.FirstOrDefault(time => time.Key == "imsak");
        var iftar = day.Times.FirstOrDefault(time => time.Key == "maghrib");

        return new RamadanDayDto(
            day.Date,
            isRamadan ? day.Hijri?.Day : null,
            isRamadan,
            suhoor?.At,
            suhoor?.Time,
            iftar?.At,
            iftar?.Time,
            day.Hijri,
            day.Location,
            day.Method,
            ContentNotices.PrayerCalculated);
    }

    public async Task<IReadOnlyList<CalculationMethodDto>> GetMethodsAsync(
        CancellationToken cancellationToken = default)
    {
        var methods = await _cache.GetOrCreateAsync(
            "prayer:methods",
            TimeSpan.FromDays(7),
            async ct =>
            {
                var response = await GetJsonAsync<AladhanEnvelope<Dictionary<string, AladhanMethod>>>(
                    "methods", ct);
                return Require(response.Data, "the calculation method list");
            },
            cancellationToken);

        return methods
            // The provider includes a "CUSTOM" placeholder with no usable id.
            .Where(pair => pair.Value.Id > 0)
            .Select(pair => new CalculationMethodDto(
                pair.Value.Id,
                pair.Key,
                pair.Value.Name,
                PrayerMapper.FormatParameters(pair.Value.Params),
                pair.Value.Id == _options.DefaultMethod))
            .OrderBy(item => item.Id)
            .ToList();
    }

    // -----------------------------------------------------------------------
    // Shared helpers
    // -----------------------------------------------------------------------

    private static PrayerDayDto BuildDay(
        AladhanTimingsData data,
        int methodId,
        int schoolId,
        string? place)
    {
        var date = data.Date?.Gregorian is not null
            ? CalendarMapper.ParseDate(data.Date.Gregorian.Date)
            : DateOnly.FromDateTime(DateTime.UtcNow);

        var timezone = data.Meta?.Timezone ?? string.Empty;

        return new PrayerDayDto(
            date,
            data.Date?.Readable ?? date.ToString("d MMMM yyyy", CultureInfo.InvariantCulture),
            data.Date?.Hijri is not null ? CalendarMapper.ToHijri(data.Date.Hijri) : null,
            new PrayerLocationDto(
                data.Meta?.Latitude ?? 0,
                data.Meta?.Longitude ?? 0,
                timezone,
                place),
            PrayerMapper.ToSummary(data.Meta, methodId, schoolId),
            PrayerMapper.ToTimes(data, date, timezone),
            ContentNotices.PrayerCalculated);
    }

    private (int Method, int School) ResolveCalculation(int? method, int? school)
    {
        var methodId = method ?? _options.DefaultMethod;
        var schoolId = school ?? _options.DefaultSchool;

        if (methodId < 0 || methodId > 99)
        {
            throw new RequestValidationException(
                "Calculation method must be between 0 and 99. Call /api/prayer/methods for the list.",
                nameof(method));
        }

        if (schoolId is not (0 or 1))
        {
            throw new RequestValidationException(
                "School must be 0 (Shafi) or 1 (Hanafi).",
                nameof(school));
        }

        return (methodId, schoolId);
    }

    private static void ValidateCoordinates(double latitude, double longitude)
    {
        if (double.IsNaN(latitude) || latitude < -90 || latitude > 90)
        {
            throw new RequestValidationException(
                "Latitude must be between -90 and 90.", nameof(latitude));
        }

        if (double.IsNaN(longitude) || longitude < -180 || longitude > 180)
        {
            throw new RequestValidationException(
                "Longitude must be between -180 and 180.", nameof(longitude));
        }
    }

    private static string RequireText(string value, string parameterName)
    {
        var trimmed = (value ?? string.Empty).Trim();

        if (trimmed.Length is 0 or > 80)
        {
            throw new RequestValidationException(
                $"{parameterName} must be between 1 and 80 characters.", parameterName);
        }

        return trimmed;
    }

    /// <summary>Rounds a coordinate for use in a cache key. See CoordinatePrecision.</summary>
    private static string Round(double value) =>
        Math.Round(value, CoordinatePrecision).ToString("0.##", CultureInfo.InvariantCulture);

    /// <summary>Formats a coordinate for a URL, always with a dot as separator.</summary>
    private static string Format(double value) =>
        value.ToString("0.######", CultureInfo.InvariantCulture);

    private T Require<T>(T? value, string what) where T : class =>
        value ?? throw new ExternalApiException(ServiceName, $"{ServiceName} returned no data for {what}.");
}
