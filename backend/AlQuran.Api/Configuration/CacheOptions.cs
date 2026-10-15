using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>
/// In-memory cache durations. The Quran never changes, so we cache it hard;
/// prayer times change daily; mosque data changes rarely.
/// This is a large part of why the backend exists: it shields the free upstream
/// APIs from repeated identical requests.
/// </summary>
public sealed class CacheOptions
{
    public const string SectionName = "Cache";

    /// <summary>Quran text, surah list, juz - effectively immutable.</summary>
    [Range(1, 43200)]
    public int QuranMinutes { get; set; } = 10080; // 7 days

    /// <summary>Prayer times and Hijri dates for a specific day.</summary>
    [Range(1, 10080)]
    public int PrayerMinutes { get; set; } = 720; // 12 hours

    /// <summary>Geocoding results for a place name.</summary>
    [Range(1, 43200)]
    public int GeocodingMinutes { get; set; } = 1440; // 24 hours

    /// <summary>Mosque search results for a rounded coordinate.</summary>
    [Range(1, 43200)]
    public int MosqueMinutes { get; set; } = 1440; // 24 hours

    /// <summary>Upper bound on cache entries, so memory cannot grow without limit.</summary>
    [Range(64, 100000)]
    public int SizeLimit { get; set; } = 5000;
}
