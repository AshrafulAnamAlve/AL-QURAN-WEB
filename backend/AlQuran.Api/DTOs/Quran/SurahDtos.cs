namespace AlQuran.Api.DTOs.Quran;

/// <summary>One surah in the browse list.</summary>
/// <param name="Number">Surah number, 1-114.</param>
/// <param name="ArabicName">Arabic name, e.g. سُورَةُ ٱلْفَاتِحَةِ.</param>
/// <param name="EnglishName">Latin transliteration, e.g. "Al-Fatihah".</param>
/// <param name="EnglishMeaning">Meaning of the name in English, e.g. "The Opening".</param>
/// <param name="BanglaName">Name transliterated into Bengali script, e.g. আল-ফাতিহা.</param>
/// <param name="BanglaMeaning">Meaning of the name in Bangla, e.g. সূচনা.</param>
/// <param name="AyahCount">Number of ayahs in the surah.</param>
/// <param name="RevelationType">"Meccan" or "Medinan".</param>
/// <param name="HasBismillah">
/// Whether the reading view should print the Bismillah above ayah 1. False for
/// At-Tawbah, which has none, and for Al-Fatihah, where it is ayah 1 already.
/// </param>
public sealed record SurahSummaryDto(
    int Number,
    string ArabicName,
    string EnglishName,
    string EnglishMeaning,
    string BanglaName,
    string BanglaMeaning,
    int AyahCount,
    string RevelationType,
    bool HasBismillah);

/// <summary>Minimal reference to a surah, used for previous/next links and headings.</summary>
public sealed record SurahLinkDto(int Number, string EnglishName, string BanglaName);

/// <summary>A surah with all of its ayahs, ready for the reading view.</summary>
/// <param name="Surah">Header information for the surah.</param>
/// <param name="Ayahs">Every ayah, in order.</param>
/// <param name="Previous">The surah before this one, or null for Al-Fatihah.</param>
/// <param name="Next">The surah after this one, or null for An-Nas.</param>
/// <param name="BismillahArabic">
/// The Bismillah text to print above ayah 1, or null when it does not belong.
/// Taken from the fetched Quran text, never typed by hand.
/// </param>
public sealed record SurahDetailDto(
    SurahSummaryDto Surah,
    IReadOnlyList<AyahDto> Ayahs,
    SurahLinkDto? Previous,
    SurahLinkDto? Next,
    string? BismillahArabic);
