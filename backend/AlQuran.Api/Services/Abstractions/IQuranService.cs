using AlQuran.Api.DTOs.Quran;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Everything the app needs from the Quran data provider.
///
/// Controllers depend on this interface, never on AlQuran.cloud directly, so
/// changing provider means writing one new implementation and nothing else.
/// </summary>
public interface IQuranService
{
    /// <summary>All 114 surahs, with Arabic, English and Bangla names.</summary>
    Task<IReadOnlyList<SurahSummaryDto>> GetSurahsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// One surah with every ayah, plus the requested translations.
    /// </summary>
    /// <param name="surahNumber">Surah number, 1-114.</param>
    /// <param name="translationEditions">Translation edition identifiers, e.g. ["bn.bengali"].</param>
    /// <param name="reciter">Reciter edition used to build the per-ayah audio URLs.</param>
    /// <param name="cancellationToken">Cancels the upstream request.</param>
    Task<SurahDetailDto> GetSurahAsync(
        int surahNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default);

    /// <summary>One ayah, addressed as surah and ayah number.</summary>
    Task<AyahDto> GetAyahAsync(
        int surahNumber,
        int ayahNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default);

    /// <summary>One ayah, addressed by its position in the whole Quran (1-6236).</summary>
    Task<AyahDto> GetAyahByGlobalNumberAsync(
        int globalNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default);

    /// <summary>All 30 juz, with the range of ayahs each one covers.</summary>
    Task<IReadOnlyList<JuzSummaryDto>> GetJuzListAsync(CancellationToken cancellationToken = default);

    /// <summary>One juz with every ayah it contains.</summary>
    Task<JuzDetailDto> GetJuzAsync(
        int juzNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Keyword search over one edition, plus surah-name matching and
    /// recognition of "2:255" style references.
    /// </summary>
    Task<SearchResponseDto> SearchAsync(
        string query,
        string? edition,
        int limit,
        int? surahNumber = null,
        CancellationToken cancellationToken = default);

    /// <summary>Text editions available, optionally filtered to one language.</summary>
    Task<IReadOnlyList<EditionDto>> GetEditionsAsync(
        string? language = null,
        CancellationToken cancellationToken = default);

    /// <summary>Reciters whose recitation the audio CDN serves.</summary>
    Task<IReadOnlyList<ReciterDto>> GetRecitersAsync(CancellationToken cancellationToken = default);
}
