namespace AlQuran.Api.Services.Quran;

/// <summary>
/// The reciters this app will play, and the CDN bitrate that actually serves
/// their per-ayah files.
///
/// Why this list is curated rather than taken straight from the provider:
///
/// 1. AlQuran.cloud lists 190 audio editions, but 152 of them are
///    <c>surahbysurah</c> - one MP3 per surah, not per ayah. This app plays,
///    repeats and auto-advances a single ayah at a time, so those editions have
///    no file at the URL we would build and every play would 404.
///
/// 2. The bitrate is not uniform. islamic.network stores each edition under the
///    bitrates it was encoded at, and they range from 32 to 192 kbps. A single
///    hard-coded bitrate returns 404 for most reciters.
///
/// Every entry below was verified on 2026-09-05 by requesting twelve ayahs
/// spread across the whole Quran (1, 7, 262, 1000, 2000, 3000, 4000, 5000,
/// 5672, 6000, 6200 and 6236) from
/// <c>cdn.islamic.network/quran/audio/{bitrate}/{identifier}/{ayah}.mp3</c>.
/// All twelve returned 200 with a non-empty body for each reciter listed.
///
/// Names follow the same rule as <see cref="SurahNames"/>: the conventional
/// English spelling, not the provider's. A style is claimed only where the
/// provider's own Arabic name marks one (المرتل / المجود) - nothing is inferred.
///
/// Excluded on purpose: the recited *translations* the provider also lists
/// (English, Urdu, Turkish and others). They are a translator reading a
/// translation, not Quranic recitation, and offering them under "Reciter" would
/// misrepresent what they are.
/// </summary>
public static class Reciters
{
    /// <summary>One reciter available for per-ayah playback.</summary>
    /// <param name="Identifier">Edition identifier used in the CDN path.</param>
    /// <param name="Name">Arabic name, exactly as the provider spells it.</param>
    /// <param name="EnglishName">Conventional English spelling.</param>
    /// <param name="Style">"Murattal" or "Mujawwad", or empty when unmarked.</param>
    /// <param name="Bitrate">The CDN bitrate folder verified to serve this edition.</param>
    public sealed record Entry(
        string Identifier,
        string Name,
        string EnglishName,
        string Style,
        int Bitrate);

    private static readonly Entry[] All =
    [
        new("ar.abdulsamad", "عبدالباسط عبدالصمد", "Abdul Basit Abdus-Samad", "", 64),
        new("ar.abdulbasitmurattal", "عبد الباسط عبد الصمد المرتل", "Abdul Basit Abdus-Samad", "Murattal", 64),
        new("ar.abdullahbasfar", "عبد الله بصفر", "Abdullah Basfar", "", 64),
        new("ar.abdurrahmaansudais", "عبدالرحمن السديس", "Abdurrahman As-Sudais", "", 64),
        new("ar.shaatree", "أبو بكر الشاطري", "Abu Bakr Ash-Shatri", "", 128),
        new("ar.ahmedajamy", "أحمد بن علي العجمي", "Ahmed ibn Ali Al-Ajamy", "", 128),
        new("ar.hudhaify", "علي بن عبدالرحمن الحذيفي", "Ali Al-Hudhaify", "", 128),
        new("ar.aymanswoaid", "أيمن سويد", "Ayman Suwaid", "", 64),
        new("ar.hanirifai", "هاني الرفاعي", "Hani Ar-Rifai", "", 64),
        new("ar.ibrahimakhbar", "إبراهيم الأخضر", "Ibrahim Al-Akhdar", "", 32),
        new("ar.mahermuaiqly", "ماهر المعيقلي", "Maher Al-Muaiqly", "", 128),
        new("ar.husary", "محمود خليل الحصري", "Mahmoud Khalil Al-Husary", "", 128),
        new("ar.husarymujawwad", "محمود خليل الحصري (المجود)", "Mahmoud Khalil Al-Husary", "Mujawwad", 128),
        new("ar.alafasy", "مشاري العفاسي", "Mishary Rashid Alafasy", "", 128),
        new("ar.minshawi", "محمد صديق المنشاوي", "Mohamed Siddiq Al-Minshawi", "", 128),
        new("ar.minshawimujawwad", "محمد صديق المنشاوي (المجود)", "Mohamed Siddiq Al-Minshawi", "Mujawwad", 64),
        new("ar.muhammadayyoub", "محمد أيوب", "Muhammad Ayyoub", "", 128),
        new("ar.muhammadjibreel", "محمد جبريل", "Muhammad Jibreel", "", 128),
        new("ar.saoodshuraym", "سعود الشريم", "Saud Ash-Shuraim", "", 64),
        new("ar.parhizgar", "شهریار پرهیزگار", "Shahriar Parhizgar", "", 48),
    ];

    private static readonly IReadOnlyDictionary<string, Entry> Lookup =
        All.ToDictionary(entry => entry.Identifier, StringComparer.OrdinalIgnoreCase);

    /// <summary>Every reciter, ordered by English name then style.</summary>
    public static IReadOnlyList<Entry> Ordered { get; } =
        [.. All
            .OrderBy(entry => entry.EnglishName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(entry => entry.Style, StringComparer.OrdinalIgnoreCase)];

    /// <summary>True when this identifier is one we are willing to build a URL for.</summary>
    public static bool IsSupported(string identifier) => Lookup.ContainsKey(identifier);

    /// <summary>The entry for an identifier, or null when it is not supported.</summary>
    public static Entry? Find(string identifier) =>
        Lookup.TryGetValue(identifier, out var entry) ? entry : null;
}
