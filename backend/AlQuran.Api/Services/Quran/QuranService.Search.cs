using System.Net;
using System.Text.RegularExpressions;
using AlQuran.Api.DTOs.Quran;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.AlQuranCloud;

namespace AlQuran.Api.Services.Quran;

/// <summary>Search, editions and reciters.</summary>
public sealed partial class QuranService
{
    /// <summary>Shortest query we will send upstream.</summary>
    private const int MinQueryLength = 2;

    public async Task<SearchResponseDto> SearchAsync(
        string query,
        string? edition,
        int limit,
        int? surahNumber = null,
        CancellationToken cancellationToken = default)
    {
        var trimmed = (query ?? string.Empty).Trim();

        if (trimmed.Length < MinQueryLength)
        {
            throw new RequestValidationException(
                $"Enter at least {MinQueryLength} characters to search.",
                nameof(query));
        }

        if (surahNumber is not null)
        {
            ValidateSurahNumber(surahNumber.Value);
        }

        limit = Math.Clamp(limit, 1, 100);

        var searchEdition = string.IsNullOrWhiteSpace(edition)
            ? _options.BanglaEdition
            : QuranMapper.NormaliseEditions([edition])[0];

        // Three kinds of answer, gathered independently: a "2:255" reference,
        // surah-name matches, and full-text matches.
        var directReference = await ResolveReferenceAsync(trimmed, cancellationToken);
        var surahMatches = await FindSurahsByNameAsync(trimmed, cancellationToken);
        var (total, matches) = await SearchTextAsync(trimmed, searchEdition, surahNumber, cancellationToken);

        return new SearchResponseDto(
            trimmed,
            searchEdition,
            total,
            matches.Take(limit).ToList(),
            directReference,
            surahMatches);
    }

    /// <summary>
    /// Recognises "2:255", "2.255", "2-255" and "2 255" so a reference typed into
    /// the search box jumps straight to the ayah instead of returning nothing.
    /// </summary>
    private async Task<AyahReferenceDto?> ResolveReferenceAsync(
        string query,
        CancellationToken cancellationToken)
    {
        var match = ReferencePattern().Match(query);

        if (!match.Success
            || !int.TryParse(match.Groups[1].Value, out var surah)
            || !int.TryParse(match.Groups[2].Value, out var ayah))
        {
            return null;
        }

        try
        {
            AyahPositions.ToGlobal(surah, ayah);
        }
        catch (RequestValidationException)
        {
            // A reference that does not exist is simply not a reference.
            return null;
        }

        var surahs = await GetSurahsAsync(cancellationToken);
        var name = surahs.FirstOrDefault(item => item.Number == surah)?.EnglishName
                   ?? SurahNames.Get(surah).EnglishName;

        return new AyahReferenceDto(surah, ayah, name);
    }

    /// <summary>
    /// Matches the query against surah names in English and Bangla, and against
    /// the surah number, so "kahf", the Bangla name, and "18" all find Al-Kahf.
    /// </summary>
    private async Task<IReadOnlyList<SurahLinkDto>> FindSurahsByNameAsync(
        string query,
        CancellationToken cancellationToken)
    {
        var surahs = await GetSurahsAsync(cancellationToken);
        var comparison = StringComparison.OrdinalIgnoreCase;
        var byNumber = int.TryParse(query, out var number) ? number : (int?)null;

        return surahs
            .Where(surah =>
                surah.Number == byNumber
                || surah.EnglishName.Contains(query, comparison)
                || surah.EnglishMeaning.Contains(query, comparison)
                || surah.BanglaName.Contains(query, comparison)
                || surah.BanglaMeaning.Contains(query, comparison))
            .Take(8)
            .Select(surah => new SurahLinkDto(surah.Number, surah.EnglishName, surah.BanglaName))
            .ToList();
    }

    /// <summary>Full-text search over one edition.</summary>
    private async Task<(int Total, IReadOnlyList<SearchMatchDto> Matches)> SearchTextAsync(
        string query,
        string edition,
        int? surahNumber,
        CancellationToken cancellationToken)
    {
        var scope = surahNumber?.ToString() ?? "all";
        var key = $"quran:search:{edition}:{scope}:{query.ToLowerInvariant()}";

        var data = await _cache.GetOrCreateAsync<UpstreamSearchData?>(
            key,
            _cacheDuration,
            async ct =>
            {
                try
                {
                    var url = $"search/{Uri.EscapeDataString(query)}/{scope}/{edition}";
                    var response = await GetJsonAsync<AlQuranEnvelope<UpstreamSearchData>>(url, ct);
                    return response.Data;
                }
                catch (ExternalApiException ex) when (ex.UpstreamStatusCode == HttpStatusCode.NotFound)
                {
                    // The provider answers 404 when a term matches nothing.
                    // That is an empty result, not a failure.
                    Logger.LogDebug("No search matches for {Query} in {Edition}", query, edition);
                    return null;
                }
            },
            cancellationToken);

        if (data is null)
        {
            return (0, []);
        }

        var matches = data.Matches
            .Select(match =>
            {
                var surah = match.Surah?.Number ?? AyahPositions.FromGlobal(match.Number).Surah;
                var reference = SurahNames.Find(surah);

                return new SearchMatchDto(
                    surah,
                    // Reference table first, for the same spelling reason as ToSurahSummary.
                    reference?.EnglishName ?? match.Surah?.EnglishName ?? string.Empty,
                    reference?.BanglaName ?? string.Empty,
                    match.NumberInSurah,
                    match.Number,
                    QuranMapper.CleanText(match.Text),
                    match.Edition?.Identifier ?? edition,
                    match.Edition?.Language ?? string.Empty);
            })
            .ToList();

        return (data.Count, matches);
    }

    // -----------------------------------------------------------------------
    // Editions and reciters
    // -----------------------------------------------------------------------

    public async Task<IReadOnlyList<EditionDto>> GetEditionsAsync(
        string? language = null,
        CancellationToken cancellationToken = default)
    {
        var normalised = NormaliseLanguage(language);
        var url = normalised is null
            ? "edition?format=text&type=translation"
            : $"edition/language/{normalised}";

        var editions = await _cache.GetOrCreateAsync(
            $"quran:editions:{normalised ?? "all"}",
            _cacheDuration,
            async ct =>
            {
                var response = await GetJsonAsync<AlQuranEnvelope<List<UpstreamEdition>>>(url, ct);
                return Require(response.Data, "the edition list");
            },
            cancellationToken);

        return editions
            .Where(edition => string.Equals(edition.Format, "text", StringComparison.OrdinalIgnoreCase))
            .Select(QuranMapper.ToEdition)
            .ToList();
    }

    /// <summary>
    /// The reciters this API will build audio URLs for.
    ///
    /// This does not call upstream. The provider's audio edition list is mostly
    /// surah-by-surah files that have no per-ayah URL, and it carries no bitrate,
    /// so it cannot answer the only question a client actually has: "which
    /// reciters can I play one ayah at a time, and from where?" That answer is
    /// the verified table in <see cref="Reciters"/>. Returning it directly also
    /// means the reciter picker cannot fail because a third party is down.
    /// </summary>
    public Task<IReadOnlyList<ReciterDto>> GetRecitersAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IReadOnlyList<ReciterDto> reciters =
        [.. Reciters.Ordered.Select(entry => new ReciterDto(
            entry.Identifier,
            entry.Name,
            entry.EnglishName,
            entry.Style,
            entry.Bitrate))];

        return Task.FromResult(reciters);
    }

    /// <summary>Language filters go into a URL, so only plain ISO codes are accepted.</summary>
    private static string? NormaliseLanguage(string? language)
    {
        if (string.IsNullOrWhiteSpace(language))
        {
            return null;
        }

        var value = language.Trim().ToLowerInvariant();

        if (!LanguageCode().IsMatch(value))
        {
            throw new RequestValidationException(
                "Language must be a two or three letter code such as 'bn' or 'en'.",
                nameof(language));
        }

        return value;
    }

    [GeneratedRegex(@"^\s*(\d{1,3})\s*[:.\s-]\s*(\d{1,3})\s*$", RegexOptions.CultureInvariant)]
    private static partial Regex ReferencePattern();

    [GeneratedRegex("^[a-z]{2,3}$", RegexOptions.CultureInvariant)]
    private static partial Regex LanguageCode();
}
