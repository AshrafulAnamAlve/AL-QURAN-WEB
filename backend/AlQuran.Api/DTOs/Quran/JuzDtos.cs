namespace AlQuran.Api.DTOs.Quran;

/// <summary>One juz (para) in the browse list.</summary>
/// <param name="Number">Juz number, 1-30.</param>
/// <param name="StartSurahNumber">Surah the juz begins in.</param>
/// <param name="StartSurahName">English name of that surah.</param>
/// <param name="StartSurahBanglaName">Bangla name of that surah.</param>
/// <param name="StartAyah">Ayah within that surah where the juz begins.</param>
/// <param name="EndSurahNumber">Surah the juz ends in.</param>
/// <param name="EndSurahName">English name of that surah.</param>
/// <param name="EndAyah">Ayah within that surah where the juz ends.</param>
/// <param name="AyahCount">Total ayahs in the juz.</param>
public sealed record JuzSummaryDto(
    int Number,
    int StartSurahNumber,
    string StartSurahName,
    string StartSurahBanglaName,
    int StartAyah,
    int EndSurahNumber,
    string EndSurahName,
    int EndAyah,
    int AyahCount);

/// <summary>A juz with all of its ayahs.</summary>
/// <param name="Number">Juz number, 1-30.</param>
/// <param name="Ayahs">Every ayah in the juz, in order.</param>
/// <param name="Surahs">The surahs this juz spans, for section headings.</param>
public sealed record JuzDetailDto(
    int Number,
    IReadOnlyList<AyahDto> Ayahs,
    IReadOnlyList<SurahLinkDto> Surahs);
