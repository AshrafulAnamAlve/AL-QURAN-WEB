namespace AlQuran.Api.Services.Common;

/// <summary>
/// Single source of truth describing every third-party API this project uses.
/// Program.cs registers one named HttpClient per entry, the /api/meta endpoint
/// publishes the catalogue, and /api/health/upstreams pings each one.
/// Adding a provider means adding it here and nowhere else.
/// </summary>
public static class ExternalApiRegistry
{
    public const string QuranApi = "QuranApi";
    public const string QuranAudio = "QuranAudio";
    public const string PrayerApi = "PrayerApi";
    public const string GeocodingApi = "GeocodingApi";
    public const string OverpassApi = "OverpassApi";

    /// <summary>Descriptive metadata that never changes at runtime.</summary>
    /// <param name="Key">Configuration key and named-HttpClient name.</param>
    /// <param name="Provider">Who runs the service.</param>
    /// <param name="Purpose">What this project uses it for.</param>
    /// <param name="DocsUrl">Provider documentation.</param>
    /// <param name="IsFree">Free to use at the volumes this project needs.</param>
    /// <param name="RequiresApiKey">Whether the provider demands a key.</param>
    /// <param name="HealthCheckPath">Small, cheap relative URL used for connectivity checks.</param>
    public sealed record Descriptor(
        string Key,
        string Provider,
        string Purpose,
        string DocsUrl,
        bool IsFree,
        bool RequiresApiKey,
        string HealthCheckPath);

    /// <summary>Every provider, in the order they should be displayed.</summary>
    public static IReadOnlyList<Descriptor> All { get; } =
    [
        new(
            QuranApi,
            "AlQuran.cloud",
            "Quran Arabic text, surah and juz metadata, Bangla and English translations, keyword search",
            "https://alquran.cloud/api",
            IsFree: true,
            RequiresApiKey: false,
            HealthCheckPath: "edition/language/bn"),

        new(
            QuranAudio,
            "islamic.network CDN",
            "Streaming recitation audio, one MP3 per ayah, multiple reciters",
            "https://islamic.network/quran/audio",
            IsFree: true,
            RequiresApiKey: false,
            HealthCheckPath: "128/ar.alafasy/1.mp3"),

        new(
            PrayerApi,
            "Aladhan API",
            "Daily prayer times, Hijri calendar conversion, Ramadan Suhoor and Iftar timings",
            "https://aladhan.com/prayer-times-api",
            IsFree: true,
            RequiresApiKey: false,
            HealthCheckPath: "gToH?date=01-01-2026"),

        new(
            GeocodingApi,
            "OpenStreetMap Nominatim",
            "City search and reverse geocoding so users can pick a location without GPS",
            "https://nominatim.org/release-docs/latest/api/Overview/",
            IsFree: true,
            RequiresApiKey: false,
            HealthCheckPath: "search?q=Dhaka&format=json&limit=1"),

        new(
            OverpassApi,
            "Overpass API (OpenStreetMap)",
            "Nearby mosque lookup from open OpenStreetMap data",
            "https://wiki.openstreetmap.org/wiki/Overpass_API",
            IsFree: true,
            RequiresApiKey: false,
            HealthCheckPath: string.Empty),
    ];

    public static Descriptor Get(string key) =>
        All.FirstOrDefault(d => d.Key == key)
        ?? throw new InvalidOperationException($"Unknown external API key '{key}'.");
}
