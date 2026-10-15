namespace AlQuran.Api.Services.Prayer;

/// <summary>
/// The timetable entries this API surfaces, in chronological order, with names
/// in English, Arabic and Bangla.
///
/// Aladhan returns more keys than these (Firstthird, Lastthird, Sunset). We pick
/// the ones a reader actually needs and drop the rest, so the UI does not have
/// to know which of the provider's keys are prayers and which are markers.
/// </summary>
public static class PrayerNames
{
    /// <summary>One timetable entry.</summary>
    /// <param name="Key">Lowercase identifier used by the frontend.</param>
    /// <param name="UpstreamKey">Key as Aladhan spells it.</param>
    /// <param name="Name">English name.</param>
    /// <param name="ArabicName">Arabic name.</param>
    /// <param name="BanglaName">Bangla name.</param>
    /// <param name="IsPrayer">
    /// False for entries that mark a time rather than a salah, so the countdown
    /// can skip them when working out the next prayer.
    /// </param>
    public sealed record Entry(
        string Key,
        string UpstreamKey,
        string Name,
        string ArabicName,
        string BanglaName,
        bool IsPrayer);

    /// <summary>Aladhan key for the end of Suhoor.</summary>
    public const string ImsakKey = "Imsak";

    /// <summary>Aladhan key for the time the fast is broken.</summary>
    public const string MaghribKey = "Maghrib";

    private static readonly Entry[] Entries =
    [
        new("imsak", "Imsak", "Imsak", "الإمساك", "সাহরির শেষ", IsPrayer: false),
        new("fajr", "Fajr", "Fajr", "الفجر", "ফজর", IsPrayer: true),
        new("sunrise", "Sunrise", "Sunrise", "الشروق", "সূর্যোদয়", IsPrayer: false),
        new("dhuhr", "Dhuhr", "Dhuhr", "الظهر", "যোহর", IsPrayer: true),
        new("asr", "Asr", "Asr", "العصر", "আসর", IsPrayer: true),
        new("maghrib", "Maghrib", "Maghrib", "المغرب", "মাগরিব", IsPrayer: true),
        new("isha", "Isha", "Isha", "العشاء", "এশা", IsPrayer: true),
        new("midnight", "Midnight", "Midnight", "منتصف الليل", "মধ্যরাত", IsPrayer: false),
    ];

    /// <summary>Every entry we surface, in chronological order.</summary>
    public static IReadOnlyList<Entry> All => Entries;

    /// <summary>The five daily prayers only.</summary>
    public static IEnumerable<Entry> Prayers => Entries.Where(entry => entry.IsPrayer);
}
