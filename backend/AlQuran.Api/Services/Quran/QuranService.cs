using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Quran;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.AlQuranCloud;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Quran data, backed by AlQuran.cloud.
///
/// Caching strategy: the raw upstream payload is cached, not the finished DTO.
/// Audio URLs depend on the chosen reciter, and caching per reciter would keep
/// several identical copies of Al-Baqarah in memory for no benefit. Fetching is
/// the expensive part; mapping is free.
/// </summary>
public sealed partial class QuranService : ExternalApiClientBase, IQuranService
{
    private readonly ICacheService _cache;
    private readonly QuranApiOptions _options;
    private readonly AudioUrlBuilder _audio;
    private readonly TimeSpan _cacheDuration;

    public QuranService(
        IHttpClientFactory httpClientFactory,
        ILogger<QuranService> logger,
        ICacheService cache,
        AudioUrlBuilder audio,
        IOptions<QuranApiOptions> options,
        IOptions<CacheOptions> cacheOptions)
        : base(httpClientFactory.CreateClient(ExternalApiRegistry.QuranApi), logger, "AlQuran.cloud")
    {
        _cache = cache;
        _audio = audio;
        _options = options.Value;
        _cacheDuration = TimeSpan.FromMinutes(cacheOptions.Value.QuranMinutes);
    }

    // -----------------------------------------------------------------------
    // Surah list
    // -----------------------------------------------------------------------

    public async Task<IReadOnlyList<SurahSummaryDto>> GetSurahsAsync(
        CancellationToken cancellationToken = default)
    {
        var upstream = await _cache.GetOrCreateAsync(
            "quran:surahs",
            _cacheDuration,
            async ct =>
            {
                var response = await GetJsonAsync<AlQuranEnvelope<List<UpstreamSurahSummary>>>("surah", ct);
                return Require(response.Data, "the surah list");
            },
            cancellationToken);

        VerifyAyahCounts(upstream);

        return upstream.Select(QuranMapper.ToSurahSummary).ToList();
    }

    /// <summary>
    /// Compares upstream ayah counts against the local reference table.
    /// A mismatch means one of the two is wrong, which is worth knowing about in
    /// a Quran app, so it is logged rather than silently accepted. The upstream
    /// value is what gets served either way.
    /// </summary>
    private void VerifyAyahCounts(IEnumerable<UpstreamSurahSummary> surahs)
    {
        foreach (var surah in surahs)
        {
            var reference = SurahNames.Find(surah.Number);

            if (reference is not null && reference.AyahCount != surah.NumberOfAyahs)
            {
                Logger.LogWarning(
                    "Ayah count mismatch for surah {Surah}: upstream {Upstream}, reference table {Reference}",
                    surah.Number, surah.NumberOfAyahs, reference.AyahCount);
            }
        }
    }

    // -----------------------------------------------------------------------
    // One surah
    // -----------------------------------------------------------------------

    public async Task<SurahDetailDto> GetSurahAsync(
        int surahNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default)
    {
        ValidateSurahNumber(surahNumber);

        var translations = QuranMapper.NormaliseEditions(translationEditions);
        var reciterId = _audio.Normalise(reciter);
        var editions = BuildEditionList(translations);

        var blocks = await GetSurahBlocksAsync(surahNumber, editions, cancellationToken);
        var arabicBlock = SelectArabicBlock(blocks);
        var translationBlocks = blocks.Where(block => !ReferenceEquals(block, arabicBlock)).ToList();

        var showBismillah = QuranMapper.ShouldShowBismillah(surahNumber);
        var bismillah = showBismillah ? await GetBismillahAsync(cancellationToken) : null;

        var ayahs = new List<AyahDto>(arabicBlock.Ayahs.Count);

        for (var index = 0; index < arabicBlock.Ayahs.Count; index++)
        {
            var arabicAyah = arabicBlock.Ayahs[index];
            var text = QuranMapper.CleanText(arabicAyah.Text);

            // Only ayah 1 carries the prepended Bismillah.
            if (index == 0 && showBismillah)
            {
                text = QuranMapper.StripBismillah(text, bismillah);
            }

            ayahs.Add(BuildAyah(arabicAyah, text, surahNumber, translationBlocks, index, reciterId));
        }

        return new SurahDetailDto(
            QuranMapper.ToSurahSummary(arabicBlock),
            ayahs,
            surahNumber > 1 ? await BuildLinkAsync(surahNumber - 1, cancellationToken) : null,
            surahNumber < SurahNames.SurahCount
                ? await BuildLinkAsync(surahNumber + 1, cancellationToken)
                : null,
            showBismillah ? bismillah : null);
    }

    /// <summary>Fetches, and caches, the raw multi-edition payload for one surah.</summary>
    private Task<List<UpstreamSurahWithAyahs>> GetSurahBlocksAsync(
        int surahNumber,
        IReadOnlyList<string> editions,
        CancellationToken cancellationToken)
    {
        var key = $"quran:surah:{surahNumber}:{string.Join('+', editions)}";

        return _cache.GetOrCreateAsync(
            key,
            _cacheDuration,
            async ct =>
            {
                var url = $"surah/{surahNumber}/editions/{string.Join(',', editions)}";
                var response = await GetJsonAsync<AlQuranEnvelope<List<UpstreamSurahWithAyahs>>>(url, ct);
                var data = Require(response.Data, $"surah {surahNumber}");

                if (data.Count == 0)
                {
                    throw new ExternalApiException(ServiceName, $"Surah {surahNumber} came back empty.");
                }

                return data;
            },
            cancellationToken);
    }

    /// <summary>
    /// The Arabic block is identified by its edition, not by position: the
    /// provider does not promise to return editions in the order they were asked
    /// for, and getting this wrong would render a translation as the Arabic text.
    /// </summary>
    private UpstreamSurahWithAyahs SelectArabicBlock(List<UpstreamSurahWithAyahs> blocks) =>
        blocks.FirstOrDefault(block =>
            string.Equals(block.Edition?.Identifier, _options.ArabicEdition, StringComparison.OrdinalIgnoreCase))
        ?? blocks[0];

    /// <summary>Arabic first, then the requested translations.</summary>
    private IReadOnlyList<string> BuildEditionList(IReadOnlyList<string> translations)
    {
        var editions = new List<string> { _options.ArabicEdition };

        foreach (var translation in translations)
        {
            if (!editions.Contains(translation, StringComparer.OrdinalIgnoreCase))
            {
                editions.Add(translation);
            }
        }

        return editions;
    }

    /// <summary>
    /// The Bismillah, taken from ayah 1:1 in the configured Arabic edition.
    /// Reading it from the data rather than hard-coding it guarantees the script
    /// matches the edition exactly, character for character.
    /// </summary>
    private Task<string> GetBismillahAsync(CancellationToken cancellationToken) =>
        _cache.GetOrCreateAsync(
            $"quran:bismillah:{_options.ArabicEdition}",
            _cacheDuration,
            async ct =>
            {
                var response = await GetJsonAsync<AlQuranEnvelope<UpstreamAyah>>(
                    $"ayah/1/{_options.ArabicEdition}", ct);

                return QuranMapper.CleanText(Require(response.Data, "the Bismillah").Text);
            },
            cancellationToken);

    private async Task<SurahLinkDto> BuildLinkAsync(int surahNumber, CancellationToken cancellationToken)
    {
        var surahs = await GetSurahsAsync(cancellationToken);
        var match = surahs.FirstOrDefault(surah => surah.Number == surahNumber);

        return match is not null
            ? new SurahLinkDto(match.Number, match.EnglishName, match.BanglaName)
            : QuranMapper.ToSurahLink(surahNumber, SurahNames.Get(surahNumber).EnglishName);
    }

    /// <summary>Combines the Arabic ayah with the matching ayah from each translation.</summary>
    private AyahDto BuildAyah(
        UpstreamAyah arabicAyah,
        string arabicText,
        int surahNumber,
        IReadOnlyList<UpstreamSurahWithAyahs> translationBlocks,
        int index,
        string reciter)
    {
        var translations = new List<TranslationDto>(translationBlocks.Count);

        foreach (var block in translationBlocks)
        {
            // Editions are aligned ayah for ayah, but never trust an index blindly.
            if (index < block.Ayahs.Count)
            {
                // The edition comes from the block: the provider does not repeat
                // it on each ayah of a multi-edition surah response.
                translations.Add(QuranMapper.ToTranslation(block.Ayahs[index], block.Edition));
            }
        }

        return new AyahDto(
            arabicAyah.Number,
            arabicAyah.NumberInSurah,
            surahNumber,
            arabicText,
            translations,
            arabicAyah.Juz,
            arabicAyah.Page,
            arabicAyah.Ruku,
            arabicAyah.HizbQuarter,
            arabicAyah.IsSajda,
            _audio.Build(arabicAyah.Number, reciter));
    }

    // -----------------------------------------------------------------------
    // Validation and small helpers
    // -----------------------------------------------------------------------

    private static void ValidateSurahNumber(int surahNumber)
    {
        if (surahNumber < 1 || surahNumber > SurahNames.SurahCount)
        {
            throw new RequestValidationException(
                $"Surah number must be between 1 and {SurahNames.SurahCount}.",
                nameof(surahNumber));
        }
    }

    /// <summary>Turns a null upstream payload into a descriptive failure.</summary>
    private T Require<T>(T? value, string what) where T : class =>
        value ?? throw new ExternalApiException(ServiceName, $"{ServiceName} returned no data for {what}.");
}
