using System.Text.Json;

namespace AlQuran.Api.Models.Upstream.AlQuranCloud;

/// <summary>An entry from GET /surah, and the surah block nested inside an ayah.</summary>
public class UpstreamSurahSummary
{
    public int Number { get; set; }

    /// <summary>Arabic name, e.g. سُورَةُ ٱلْفَاتِحَةِ.</summary>
    public string Name { get; set; } = string.Empty;

    public string EnglishName { get; set; } = string.Empty;

    /// <summary>English meaning of the name, e.g. "The Opening".</summary>
    public string EnglishNameTranslation { get; set; } = string.Empty;

    public int NumberOfAyahs { get; set; }

    /// <summary>"Meccan" or "Medinan".</summary>
    public string RevelationType { get; set; } = string.Empty;
}

/// <summary>A surah returned with its ayahs, from GET /surah/{n}/editions/....</summary>
public sealed class UpstreamSurahWithAyahs : UpstreamSurahSummary
{
    public List<UpstreamAyah> Ayahs { get; set; } = [];

    public UpstreamEdition? Edition { get; set; }
}

/// <summary>One ayah as the provider returns it.</summary>
public sealed class UpstreamAyah
{
    /// <summary>Global ayah number, 1 to 6236. This is the key we join editions on.</summary>
    public int Number { get; set; }

    public string Text { get; set; } = string.Empty;

    /// <summary>Ayah number within its surah.</summary>
    public int NumberInSurah { get; set; }

    public int Juz { get; set; }

    public int Manzil { get; set; }

    public int Page { get; set; }

    public int Ruku { get; set; }

    public int HizbQuarter { get; set; }

    /// <summary>
    /// Polymorphic upstream field: `false` for most ayahs, but an object
    /// ({"id":1,"recommended":true,"obligatory":false}) on the 15 sajda ayahs.
    /// Kept as raw JSON and interpreted by <see cref="IsSajda"/>.
    /// </summary>
    public JsonElement Sajda { get; set; }

    /// <summary>Present when the ayah is returned outside a surah context (search, juz).</summary>
    public UpstreamSurahSummary? Surah { get; set; }

    /// <summary>Present when several editions were requested at once.</summary>
    public UpstreamEdition? Edition { get; set; }

    /// <summary>True when this ayah carries a prostration mark.</summary>
    public bool IsSajda => Sajda.ValueKind == JsonValueKind.Object;
}

/// <summary>Describes a text or audio edition (a translation, a script, a reciter).</summary>
public sealed class UpstreamEdition
{
    public string Identifier { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    /// <summary>Name in the edition's own language, e.g. মুহিউদ্দীন খান.</summary>
    public string Name { get; set; } = string.Empty;

    public string EnglishName { get; set; } = string.Empty;

    /// <summary>"text" or "audio".</summary>
    public string Format { get; set; } = string.Empty;

    /// <summary>"translation", "quran", "tafsir", "versebyverse".</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>"ltr" or "rtl".</summary>
    public string? Direction { get; set; }
}
