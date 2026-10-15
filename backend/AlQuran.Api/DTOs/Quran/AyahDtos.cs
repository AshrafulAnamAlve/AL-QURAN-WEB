namespace AlQuran.Api.DTOs.Quran;

/// <summary>One translation of an ayah.</summary>
/// <param name="Edition">Edition identifier, e.g. "bn.bengali".</param>
/// <param name="Language">ISO language code, e.g. "bn".</param>
/// <param name="Translator">Translator name in their own language.</param>
/// <param name="TranslatorEnglish">Translator name in English.</param>
/// <param name="Text">The translated text.</param>
/// <param name="Direction">"ltr" or "rtl".</param>
public sealed record TranslationDto(
    string Edition,
    string Language,
    string Translator,
    string TranslatorEnglish,
    string Text,
    string Direction);

/// <summary>A single ayah with its Arabic text and any requested translations.</summary>
/// <param name="GlobalNumber">Position in the whole Quran, 1-6236.</param>
/// <param name="NumberInSurah">Position within its surah.</param>
/// <param name="SurahNumber">Which surah this ayah belongs to.</param>
/// <param name="Arabic">Uthmani Arabic text.</param>
/// <param name="Translations">One entry per requested translation edition.</param>
/// <param name="Juz">Which juz (1-30) contains this ayah.</param>
/// <param name="Page">Page in the standard Madani mushaf.</param>
/// <param name="Ruku">Ruku number.</param>
/// <param name="HizbQuarter">Hizb quarter number.</param>
/// <param name="IsSajda">True on the ayahs that carry a prostration mark.</param>
/// <param name="AudioUrl">Direct CDN URL for the recitation of this ayah.</param>
public sealed record AyahDto(
    int GlobalNumber,
    int NumberInSurah,
    int SurahNumber,
    string Arabic,
    IReadOnlyList<TranslationDto> Translations,
    int Juz,
    int Page,
    int Ruku,
    int HizbQuarter,
    bool IsSajda,
    string AudioUrl);

/// <summary>A parsed "surah:ayah" reference such as 2:255.</summary>
public sealed record AyahReferenceDto(int SurahNumber, int AyahNumber, string SurahEnglishName);
