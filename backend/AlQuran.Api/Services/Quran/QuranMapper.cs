using System.Text.RegularExpressions;
using AlQuran.Api.DTOs.Quran;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Models.Upstream.AlQuranCloud;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Turns AlQuran.cloud shapes into this app's DTOs.
///
/// All of the provider-specific knowledge lives here: which fields map where,
/// how the Bismillah is handled, and what a valid edition identifier looks like.
/// </summary>
public static partial class QuranMapper
{
    /// <summary>Maximum translations a single request may ask for.</summary>
    public const int MaxTranslations = 3;

    /// <summary>
    /// Surahs that should NOT print a separate Bismillah above ayah 1:
    /// At-Tawbah (9) has none, and in Al-Fatihah (1) it is ayah 1 itself.
    /// </summary>
    public static bool ShouldShowBismillah(int surahNumber) => surahNumber is not (1 or 9);

    /// <summary>Combines upstream surah data with the local name table.</summary>
    /// <remarks>
    /// The English name comes from the reference table, not from the provider.
    /// AlQuran.cloud uses its own transliterations - "Al-Faatiha", "An-Naas",
    /// "Aal-i-Imraan" - which do not match what people actually type, so a search
    /// for "fatihah" found nothing. The table holds the conventional spellings
    /// ("Al-Fatihah", "An-Nas", "Ali 'Imran"), which read better and match.
    /// </remarks>
    public static SurahSummaryDto ToSurahSummary(UpstreamSurahSummary upstream)
    {
        var reference = SurahNames.Find(upstream.Number);

        return new SurahSummaryDto(
            upstream.Number,
            upstream.Name,
            reference?.EnglishName ?? upstream.EnglishName,
            upstream.EnglishNameTranslation,
            reference?.BanglaName ?? upstream.EnglishName,
            reference?.BanglaMeaning ?? upstream.EnglishNameTranslation,
            upstream.NumberOfAyahs,
            upstream.RevelationType,
            ShouldShowBismillah(upstream.Number));
    }

    /// <summary>Short reference to a surah, for previous/next links and headings.</summary>
    /// <param name="surahNumber">Surah number, 1-114.</param>
    /// <param name="englishName">Fallback name, used only if the number is unknown.</param>
    public static SurahLinkDto ToSurahLink(int surahNumber, string englishName)
    {
        var reference = SurahNames.Find(surahNumber);

        return new SurahLinkDto(
            surahNumber,
            reference?.EnglishName ?? englishName,
            reference?.BanglaName ?? englishName);
    }

    /// <summary>Maps an edition descriptor.</summary>
    public static EditionDto ToEdition(UpstreamEdition edition) => new(
        edition.Identifier,
        edition.Language,
        edition.Name,
        edition.EnglishName,
        edition.Type,
        edition.Direction ?? "ltr");

    /// <summary>Maps one ayah of a translation edition.</summary>
    /// <param name="ayah">The ayah, as the provider returned it.</param>
    /// <param name="blockEdition">
    /// Edition of the surah or juz this ayah came from.
    ///
    /// This matters: when several editions are requested for a whole surah or
    /// juz, the provider puts the edition on the enclosing block and leaves it
    /// off each ayah. Without this fallback every translation is labelled
    /// "unknown", and a client that picks translations by language finds none.
    /// The single-ayah endpoint does put it on the ayah, hence both sources.
    /// </param>
    public static TranslationDto ToTranslation(UpstreamAyah ayah, UpstreamEdition? blockEdition = null)
    {
        var edition = ayah.Edition ?? blockEdition;

        return new TranslationDto(
            edition?.Identifier ?? "unknown",
            edition?.Language ?? "unknown",
            edition?.Name ?? string.Empty,
            edition?.EnglishName ?? string.Empty,
            ayah.Text,
            edition?.Direction ?? "ltr");
    }

    /// <summary>
    /// Strips the leading byte-order mark the provider puts on the first ayah of
    /// a surah. Left in place it would render as a stray character before the
    /// Arabic text.
    /// </summary>
    public static string CleanText(string text) => text.TrimStart('﻿').Trim();

    /// <summary>
    /// Removes the Bismillah that the Uthmani edition prepends to ayah 1 of most
    /// surahs, so the reading view can show it as a heading instead of as part of
    /// the first verse.
    ///
    /// The prefix is never hard-coded: it is the text of ayah 1:1 in the same
    /// edition, so it always matches the script exactly.
    /// </summary>
    /// <param name="ayahText">Text of ayah 1, already cleaned.</param>
    /// <param name="bismillah">Text of ayah 1:1 in the same edition.</param>
    /// <returns>The ayah without the prefix, or the original text if it had none.</returns>
    public static string StripBismillah(string ayahText, string? bismillah)
    {
        if (string.IsNullOrEmpty(bismillah) || !ayahText.StartsWith(bismillah, StringComparison.Ordinal))
        {
            return ayahText;
        }

        return ayahText[bismillah.Length..].TrimStart();
    }

    /// <summary>
    /// Validates and de-duplicates the translation editions a caller asked for.
    /// Identifiers go straight into an upstream URL, so anything that is not a
    /// plain identifier is rejected rather than escaped.
    /// </summary>
    public static IReadOnlyList<string> NormaliseEditions(IReadOnlyList<string>? editions)
    {
        if (editions is null || editions.Count == 0)
        {
            return [];
        }

        var cleaned = new List<string>(editions.Count);

        foreach (var raw in editions)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                continue;
            }

            var value = raw.Trim();

            if (!EditionIdentifier().IsMatch(value))
            {
                throw new RequestValidationException(
                    $"'{value}' is not a valid edition identifier. Use values such as 'bn.bengali'.",
                    nameof(editions));
            }

            if (!cleaned.Contains(value, StringComparer.OrdinalIgnoreCase))
            {
                cleaned.Add(value);
            }
        }

        if (cleaned.Count > MaxTranslations)
        {
            throw new RequestValidationException(
                $"At most {MaxTranslations} translations may be requested at once.",
                nameof(editions));
        }

        return cleaned;
    }

    /// <summary>Splits a comma-separated query parameter into edition identifiers.</summary>
    public static IReadOnlyList<string> ParseEditionList(string? commaSeparated) =>
        NormaliseEditions(
            commaSeparated?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

    [GeneratedRegex(@"^[a-zA-Z0-9._-]{2,48}$", RegexOptions.CultureInvariant)]
    private static partial Regex EditionIdentifier();
}
