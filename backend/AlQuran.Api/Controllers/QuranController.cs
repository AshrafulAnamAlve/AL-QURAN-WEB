using AlQuran.Api.DTOs.Quran;
using AlQuran.Api.Extensions;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Quran;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AlQuran.Api.Controllers;

/// <summary>Quran text, translations, juz and search.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class QuranController : ControllerBase
{
    /// <summary>Quran content never changes, so clients may cache it for a day.</summary>
    private const int ContentCacheSeconds = 86_400;

    private readonly IQuranService _quran;

    public QuranController(IQuranService quran)
    {
        _quran = quran;
    }

    /// <summary>All 114 surahs, with Arabic, English and Bangla names.</summary>
    /// <response code="200">The surah list.</response>
    [HttpGet("surahs")]
    [ProducesResponseType<IReadOnlyList<SurahSummaryDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<IReadOnlyList<SurahSummaryDto>>> GetSurahs(
        CancellationToken cancellationToken)
        => Ok(await _quran.GetSurahsAsync(cancellationToken));

    /// <summary>One surah with every ayah and the requested translations.</summary>
    /// <param name="number">Surah number, 1-114.</param>
    /// <param name="translations">
    /// Comma-separated edition identifiers, at most three, e.g. "bn.bengali,en.sahih".
    /// Defaults to the configured Bangla translation.
    /// </param>
    /// <param name="reciter">Reciter edition for the audio URLs, e.g. "ar.alafasy".</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The surah.</response>
    /// <response code="400">The surah number or an edition identifier is invalid.</response>
    /// <response code="502">The Quran provider could not be reached.</response>
    [HttpGet("surahs/{number:int}")]
    [ProducesResponseType<SurahDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["translations", "reciter"])]
    public async Task<ActionResult<SurahDetailDto>> GetSurah(
        int number,
        [FromQuery] string? translations,
        [FromQuery] string? reciter,
        CancellationToken cancellationToken)
    {
        var editions = QuranMapper.ParseEditionList(translations);
        return Ok(await _quran.GetSurahAsync(number, editions, reciter, cancellationToken));
    }

    /// <summary>One ayah, addressed as surah and ayah number.</summary>
    /// <param name="surah">Surah number, 1-114.</param>
    /// <param name="ayah">Ayah number within that surah.</param>
    /// <param name="translations">Comma-separated edition identifiers.</param>
    /// <param name="reciter">Reciter edition for the audio URL.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The ayah.</response>
    /// <response code="400">The reference does not exist.</response>
    [HttpGet("surahs/{surah:int}/ayahs/{ayah:int}")]
    [ProducesResponseType<AyahDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["translations", "reciter"])]
    public async Task<ActionResult<AyahDto>> GetAyah(
        int surah,
        int ayah,
        [FromQuery] string? translations,
        [FromQuery] string? reciter,
        CancellationToken cancellationToken)
    {
        var editions = QuranMapper.ParseEditionList(translations);
        return Ok(await _quran.GetAyahAsync(surah, ayah, editions, reciter, cancellationToken));
    }

    /// <summary>One ayah, addressed by its position in the whole Quran.</summary>
    /// <param name="number">Global ayah number, 1-6236.</param>
    /// <param name="translations">Comma-separated edition identifiers.</param>
    /// <param name="reciter">Reciter edition for the audio URL.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The ayah.</response>
    /// <response code="400">The number is outside 1-6236.</response>
    [HttpGet("ayahs/{number:int}")]
    [ProducesResponseType<AyahDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["translations", "reciter"])]
    public async Task<ActionResult<AyahDto>> GetAyahByNumber(
        int number,
        [FromQuery] string? translations,
        [FromQuery] string? reciter,
        CancellationToken cancellationToken)
    {
        var editions = QuranMapper.ParseEditionList(translations);
        return Ok(await _quran.GetAyahByGlobalNumberAsync(number, editions, reciter, cancellationToken));
    }

    /// <summary>All 30 juz, with the range of ayahs each covers.</summary>
    /// <response code="200">The juz list.</response>
    [HttpGet("juz")]
    [ProducesResponseType<IReadOnlyList<JuzSummaryDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<IReadOnlyList<JuzSummaryDto>>> GetJuzList(
        CancellationToken cancellationToken)
        => Ok(await _quran.GetJuzListAsync(cancellationToken));

    /// <summary>One juz with every ayah it contains.</summary>
    /// <param name="number">Juz number, 1-30.</param>
    /// <param name="translations">Comma-separated edition identifiers.</param>
    /// <param name="reciter">Reciter edition for the audio URLs.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The juz.</response>
    /// <response code="400">The juz number is outside 1-30.</response>
    [HttpGet("juz/{number:int}")]
    [ProducesResponseType<JuzDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["translations", "reciter"])]
    public async Task<ActionResult<JuzDetailDto>> GetJuz(
        int number,
        [FromQuery] string? translations,
        [FromQuery] string? reciter,
        CancellationToken cancellationToken)
    {
        var editions = QuranMapper.ParseEditionList(translations);
        return Ok(await _quran.GetJuzAsync(number, editions, reciter, cancellationToken));
    }

    /// <summary>
    /// Searches the Quran. Matches the text of one edition, surah names in
    /// English and Bangla, and references such as "2:255".
    /// </summary>
    /// <param name="q">What to search for. At least two characters.</param>
    /// <param name="edition">Edition to search, defaults to the Bangla translation.</param>
    /// <param name="limit">Maximum matches to return, 1-100.</param>
    /// <param name="surah">Restrict the search to one surah.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The results, which may be empty.</response>
    /// <response code="400">The query is too short or a parameter is invalid.</response>
    /// <response code="429">Too many searches in a short time.</response>
    [HttpGet("search")]
    [EnableRateLimiting(SecurityRegistration.ExpensivePolicy)]
    [ProducesResponseType<SearchResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<SearchResponseDto>> Search(
        [FromQuery] string q,
        [FromQuery] string? edition,
        [FromQuery] int limit = 30,
        [FromQuery] int? surah = null,
        CancellationToken cancellationToken = default)
        => Ok(await _quran.SearchAsync(q, edition, limit, surah, cancellationToken));

    /// <summary>Translation editions that can be requested.</summary>
    /// <param name="language">Filter to one language code, e.g. "bn".</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The edition list.</response>
    [HttpGet("editions")]
    [ProducesResponseType<IReadOnlyList<EditionDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["language"])]
    public async Task<ActionResult<IReadOnlyList<EditionDto>>> GetEditions(
        [FromQuery] string? language,
        CancellationToken cancellationToken)
        => Ok(await _quran.GetEditionsAsync(language, cancellationToken));

    /// <summary>Reciters available from the audio CDN.</summary>
    /// <response code="200">The reciter list.</response>
    [HttpGet("reciters")]
    [ProducesResponseType<IReadOnlyList<ReciterDto>>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = ContentCacheSeconds, Location = ResponseCacheLocation.Any)]
    public async Task<ActionResult<IReadOnlyList<ReciterDto>>> GetReciters(
        CancellationToken cancellationToken)
        => Ok(await _quran.GetRecitersAsync(cancellationToken));
}
