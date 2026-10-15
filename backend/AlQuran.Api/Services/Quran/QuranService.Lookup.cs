using AlQuran.Api.DTOs.Quran;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.AlQuranCloud;

namespace AlQuran.Api.Services.Quran;

/// <summary>Single-ayah and juz lookups.</summary>
public sealed partial class QuranService
{
    // -----------------------------------------------------------------------
    // Single ayah
    // -----------------------------------------------------------------------

    public Task<AyahDto> GetAyahAsync(
        int surahNumber,
        int ayahNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default)
    {
        // Validates the pair, rejecting references such as surah 1 ayah 8.
        var global = AyahPositions.ToGlobal(surahNumber, ayahNumber);
        return GetAyahByGlobalNumberAsync(global, translationEditions, reciter, cancellationToken);
    }

    public async Task<AyahDto> GetAyahByGlobalNumberAsync(
        int globalNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default)
    {
        var (surahNumber, ayahNumber) = AyahPositions.FromGlobal(globalNumber);

        var translations = QuranMapper.NormaliseEditions(translationEditions);
        var reciterId = _audio.Normalise(reciter);
        var editions = BuildEditionList(translations);

        var entries = await GetAyahEntriesAsync(globalNumber, editions, cancellationToken);

        var arabic = entries.FirstOrDefault(entry =>
            string.Equals(entry.Edition?.Identifier, _options.ArabicEdition, StringComparison.OrdinalIgnoreCase))
            ?? entries[0];

        var text = QuranMapper.CleanText(arabic.Text);

        // Ayah 1 of most surahs arrives with the Bismillah prepended; strip it
        // here too so a single-ayah request matches what the reading view shows.
        if (ayahNumber == 1 && QuranMapper.ShouldShowBismillah(surahNumber))
        {
            text = QuranMapper.StripBismillah(text, await GetBismillahAsync(cancellationToken));
        }

        var translationDtos = entries
            .Where(entry => !ReferenceEquals(entry, arabic))
            // An explicit lambda, not a method group: ToTranslation now has an
            // optional second parameter, which makes the group ambiguous with
            // the (item, index) overload of Select.
            .Select(entry => QuranMapper.ToTranslation(entry))
            .ToList();

        return new AyahDto(
            arabic.Number,
            arabic.NumberInSurah,
            surahNumber,
            text,
            translationDtos,
            arabic.Juz,
            arabic.Page,
            arabic.Ruku,
            arabic.HizbQuarter,
            arabic.IsSajda,
            _audio.Build(arabic.Number, reciterId));
    }

    private Task<List<UpstreamAyah>> GetAyahEntriesAsync(
        int globalNumber,
        IReadOnlyList<string> editions,
        CancellationToken cancellationToken)
    {
        var key = $"quran:ayah:{globalNumber}:{string.Join('+', editions)}";

        return _cache.GetOrCreateAsync(
            key,
            _cacheDuration,
            async ct =>
            {
                var url = $"ayah/{globalNumber}/editions/{string.Join(',', editions)}";
                var response = await GetJsonAsync<AlQuranEnvelope<List<UpstreamAyah>>>(url, ct);
                var data = Require(response.Data, $"ayah {globalNumber}");

                if (data.Count == 0)
                {
                    throw new ExternalApiException(ServiceName, $"Ayah {globalNumber} came back empty.");
                }

                return data;
            },
            cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Juz
    // -----------------------------------------------------------------------

    public async Task<IReadOnlyList<JuzSummaryDto>> GetJuzListAsync(
        CancellationToken cancellationToken = default)
    {
        var surahs = await GetSurahsAsync(cancellationToken);
        var byNumber = surahs.ToDictionary(surah => surah.Number);

        var list = new List<JuzSummaryDto>(SurahNames.JuzCount);

        for (var juz = 1; juz <= SurahNames.JuzCount; juz++)
        {
            var start = JuzBoundaries.Get(juz);
            var (endSurah, endAyah) = JuzBoundaries.GetEnd(juz);

            list.Add(new JuzSummaryDto(
                juz,
                start.Surah,
                byNumber[start.Surah].EnglishName,
                byNumber[start.Surah].BanglaName,
                start.Ayah,
                endSurah,
                byNumber[endSurah].EnglishName,
                endAyah,
                AyahPositions.AyahCountInJuz(juz)));
        }

        return list;
    }

    public async Task<JuzDetailDto> GetJuzAsync(
        int juzNumber,
        IReadOnlyList<string> translationEditions,
        string? reciter = null,
        CancellationToken cancellationToken = default)
    {
        JuzBoundaries.Get(juzNumber); // validates the 1-30 range

        var translations = QuranMapper.NormaliseEditions(translationEditions);
        var reciterId = _audio.Normalise(reciter);

        // Unlike /surah, the juz endpoint takes only ONE edition per call, so we
        // fetch each edition separately and join them on the global ayah number.
        var arabicTask = GetJuzEditionAsync(juzNumber, _options.ArabicEdition, cancellationToken);
        var translationTasks = translations
            .Select(edition => GetJuzEditionAsync(juzNumber, edition, cancellationToken))
            .ToList();

        var arabic = await arabicTask;
        var translationJuz = new List<UpstreamJuz>(translationTasks.Count);

        foreach (var task in translationTasks)
        {
            translationJuz.Add(await task);
        }

        // Index each translation by global ayah number rather than by position:
        // a short response would otherwise shift every later ayah by one.
        // The edition is carried alongside because the juz endpoint puts it on
        // the response, not on each ayah.
        var translationLookups = translationJuz
            .Select(juz => (juz.Edition, Ayahs: juz.Ayahs.ToDictionary(ayah => ayah.Number)))
            .ToList();

        var bismillah = await GetBismillahAsync(cancellationToken);
        var ayahs = new List<AyahDto>(arabic.Ayahs.Count);
        var surahLinks = new List<SurahLinkDto>();

        foreach (var arabicAyah in arabic.Ayahs)
        {
            var surahNumber = arabicAyah.Surah?.Number ?? AyahPositions.FromGlobal(arabicAyah.Number).Surah;
            var text = QuranMapper.CleanText(arabicAyah.Text);

            if (arabicAyah.NumberInSurah == 1 && QuranMapper.ShouldShowBismillah(surahNumber))
            {
                text = QuranMapper.StripBismillah(text, bismillah);
            }

            var ayahTranslations = translationLookups
                .Select(source => (source.Edition, Ayah: source.Ayahs.GetValueOrDefault(arabicAyah.Number)))
                .Where(match => match.Ayah is not null)
                .Select(match => QuranMapper.ToTranslation(match.Ayah!, match.Edition))
                .ToList();

            ayahs.Add(new AyahDto(
                arabicAyah.Number,
                arabicAyah.NumberInSurah,
                surahNumber,
                text,
                ayahTranslations,
                arabicAyah.Juz,
                arabicAyah.Page,
                arabicAyah.Ruku,
                arabicAyah.HizbQuarter,
                arabicAyah.IsSajda,
                _audio.Build(arabicAyah.Number, reciterId)));

            if (surahLinks.All(link => link.Number != surahNumber))
            {
                surahLinks.Add(QuranMapper.ToSurahLink(
                    surahNumber,
                    arabicAyah.Surah?.EnglishName ?? SurahNames.Get(surahNumber).EnglishName));
            }
        }

        return new JuzDetailDto(juzNumber, ayahs, surahLinks);
    }

    private Task<UpstreamJuz> GetJuzEditionAsync(
        int juzNumber,
        string edition,
        CancellationToken cancellationToken) =>
        _cache.GetOrCreateAsync(
            $"quran:juz:{juzNumber}:{edition}",
            _cacheDuration,
            async ct =>
            {
                var response = await GetJsonAsync<AlQuranEnvelope<UpstreamJuz>>($"juz/{juzNumber}/{edition}", ct);
                return Require(response.Data, $"juz {juzNumber}");
            },
            cancellationToken);
}
