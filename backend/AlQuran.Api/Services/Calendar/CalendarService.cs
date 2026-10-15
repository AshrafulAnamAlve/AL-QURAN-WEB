using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Calendar;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.Aladhan;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Calendar;

/// <summary>
/// Hijri calendar work, backed by the Aladhan API.
///
/// Everything returned here is calculated astronomically and is labelled as such.
/// The app never presents one of these dates as an announcement.
/// </summary>
public sealed class CalendarService : ExternalApiClientBase, ICalendarService
{
    private readonly ICacheService _cache;
    private readonly TimeSpan _cacheDuration;

    public CalendarService(
        IHttpClientFactory httpClientFactory,
        ILogger<CalendarService> logger,
        ICacheService cache,
        IOptions<CacheOptions> cacheOptions)
        : base(httpClientFactory.CreateClient(ExternalApiRegistry.PrayerApi), logger, "Aladhan")
    {
        _cache = cache;

        // A calendar conversion never changes once computed, so it can be held
        // far longer than a prayer timetable.
        _cacheDuration = TimeSpan.FromMinutes(Math.Max(cacheOptions.Value.PrayerMinutes, 1440));
    }

    public IReadOnlyList<HijriMonthNameDto> GetMonths() => HijriMonths.ToDtos();

    public async Task<DateConversionDto> ToHijriAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var conversion = await _cache.GetOrCreateAsync(
            $"calendar:gToH:{date:yyyy-MM-dd}",
            _cacheDuration,
            async ct =>
            {
                var url = $"gToH/{CalendarMapper.FormatDate(date)}";
                var response = await GetJsonAsync<AladhanEnvelope<AladhanDateConversion>>(url, ct);
                return Require(response.Data, $"the Hijri date for {date:yyyy-MM-dd}");
            },
            cancellationToken);

        return BuildConversion(conversion);
    }

    public async Task<DateConversionDto> ToGregorianAsync(
        int day,
        int month,
        int year,
        CancellationToken cancellationToken = default)
    {
        ValidateHijri(day, month, year);

        var conversion = await _cache.GetOrCreateAsync(
            $"calendar:hToG:{year}-{month:D2}-{day:D2}",
            _cacheDuration,
            async ct =>
            {
                var url = $"hToG/{day:D2}-{month:D2}-{year}";
                var response = await GetJsonAsync<AladhanEnvelope<AladhanDateConversion>>(url, ct);
                return Require(response.Data, $"the Gregorian date for {day}-{month}-{year} AH");
            },
            cancellationToken);

        return BuildConversion(conversion);
    }

    public async Task<HijriMonthDto> GetHijriMonthAsync(
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        ValidateHijri(1, month, year);

        var days = await _cache.GetOrCreateAsync(
            $"calendar:month:{year}-{month:D2}",
            _cacheDuration,
            async ct =>
            {
                var response = await GetJsonAsync<AladhanEnvelope<List<AladhanDateConversion>>>(
                    $"hToGCalendar/{month}/{year}", ct);
                return Require(response.Data, $"the calendar for {month}/{year} AH");
            },
            cancellationToken);

        var reference = HijriMonths.Get(month);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Events for this month, indexed by day so each cell can show its own.
        var eventsByDay = IslamicEvents.InMonth(month)
            .GroupBy(item => item.Day)
            .ToDictionary(group => group.Key, group => group.Select(item => item.Name).ToList());

        var cells = new List<HijriDayDto>(days.Count);

        foreach (var entry in days)
        {
            if (entry.Hijri is null || entry.Gregorian is null)
            {
                continue;
            }

            var hijri = CalendarMapper.ToHijri(entry.Hijri);
            var gregorian = CalendarMapper.ToGregorian(entry.Gregorian);

            cells.Add(new HijriDayDto(
                hijri.Day,
                gregorian.Date,
                gregorian.WeekdayEn,
                gregorian.Date == today,
                eventsByDay.GetValueOrDefault(hijri.Day) ?? []));
        }

        return new HijriMonthDto(
            year,
            month,
            reference.NameEn,
            reference.NameAr,
            cells.Count,
            cells,
            ContentNotices.HijriCalculated);
    }

    public async Task<IslamicEventsDto> GetEventsAsync(
        int? hijriYear = null,
        CancellationToken cancellationToken = default)
    {
        var year = hijriYear ?? await GetCurrentHijriYearAsync(cancellationToken);
        ValidateHijriYear(year);

        var events = await _cache.GetOrCreateAsync(
            $"calendar:events:{year}",
            _cacheDuration,
            ct => ResolveEventsAsync(year, ct),
            cancellationToken);

        return new IslamicEventsDto(year, events, ContentNotices.EventsApproximate);
    }

    /// <summary>
    /// Resolves each observance to a Gregorian date.
    ///
    /// The conversions run one after another rather than in parallel: this is a
    /// free, donated API and ten simultaneous requests is not a polite way to use
    /// it. The whole list is cached afterwards, so this happens once per year.
    /// </summary>
    private async Task<List<IslamicEventDto>> ResolveEventsAsync(int year, CancellationToken cancellationToken)
    {
        var resolved = new List<IslamicEventDto>(IslamicEvents.All.Count);

        foreach (var item in IslamicEvents.All)
        {
            DateOnly? gregorian = null;

            try
            {
                var conversion = await ToGregorianAsync(item.Day, item.Month, year, cancellationToken);
                gregorian = conversion.Gregorian.Date;
            }
            catch (ExternalApiException ex)
            {
                // One unresolved date should not empty the whole list.
                Logger.LogWarning(ex, "Could not resolve {Event} for {Year} AH", item.Key, year);
            }

            resolved.Add(new IslamicEventDto(
                item.Key,
                item.Name,
                item.BanglaName,
                item.Day,
                item.Month,
                HijriMonths.Get(item.Month).NameEn,
                gregorian,
                item.Description,
                item.IsRange));
        }

        return resolved;
    }

    private async Task<int> GetCurrentHijriYearAsync(CancellationToken cancellationToken)
    {
        var today = await ToHijriAsync(DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken);
        return today.Hijri.Year;
    }

    private static DateConversionDto BuildConversion(AladhanDateConversion conversion)
    {
        if (conversion.Hijri is null || conversion.Gregorian is null)
        {
            throw new ExternalApiException("Aladhan", "The date conversion came back incomplete.");
        }

        return new DateConversionDto(
            CalendarMapper.ToHijri(conversion.Hijri),
            CalendarMapper.ToGregorian(conversion.Gregorian),
            ContentNotices.HijriCalculated);
    }

    private static void ValidateHijri(int day, int month, int year)
    {
        if (day < 1 || day > 30)
        {
            throw new RequestValidationException("Hijri day must be between 1 and 30.", nameof(day));
        }

        HijriMonths.Get(month);
        ValidateHijriYear(year);
    }

    private static void ValidateHijriYear(int year)
    {
        if (year < 1 || year > 2000)
        {
            throw new RequestValidationException("Hijri year must be between 1 and 2000.", nameof(year));
        }
    }

    private T Require<T>(T? value, string what) where T : class =>
        value ?? throw new ExternalApiException(ServiceName, $"{ServiceName} returned no data for {what}.");
}
