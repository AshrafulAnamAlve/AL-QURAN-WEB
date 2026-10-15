using System.Text.RegularExpressions;
using AlQuran.Api.Configuration;
using AlQuran.Api.Models.Common;
using Microsoft.Extensions.Options;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Builds the CDN URL for a single ayah's recitation.
///
/// The browser fetches these directly, so the backend never proxies audio - it
/// only makes sure the URL is well formed and the reciter identifier is one we
/// have actually verified serves per-ayah files.
///
/// The bitrate comes from <see cref="Reciters"/> rather than from configuration,
/// because it differs per reciter: the CDN stores each edition only under the
/// bitrates it was encoded at, from 32 to 192 kbps. The configured bitrate is
/// the fallback for an identifier with no verified entry.
/// </summary>
public sealed partial class AudioUrlBuilder
{
    private readonly QuranAudioOptions _options;

    public AudioUrlBuilder(IOptions<QuranAudioOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>The reciter used when the caller does not name one.</summary>
    public string DefaultReciter => _options.DefaultReciter;

    /// <summary>
    /// URL of the MP3 for one ayah.
    /// </summary>
    /// <param name="globalAyahNumber">Ayah position in the whole Quran, 1-6236.</param>
    /// <param name="reciter">Reciter edition identifier, or null for the default.</param>
    public string Build(int globalAyahNumber, string? reciter = null)
    {
        if (globalAyahNumber < 1 || globalAyahNumber > SurahNames.TotalAyahCount)
        {
            throw new RequestValidationException(
                $"Ayah number must be between 1 and {SurahNames.TotalAyahCount}.",
                nameof(globalAyahNumber));
        }

        var edition = Normalise(reciter);
        var bitrate = Reciters.Find(edition)?.Bitrate ?? _options.Bitrate;
        var baseUrl = _options.BaseUrl.TrimEnd('/');

        return $"{baseUrl}/{bitrate}/{edition}/{globalAyahNumber}.mp3";
    }

    /// <summary>
    /// Checks a reciter identifier before it is put into a URL.
    ///
    /// Two separate rejections, in order: anything that is not a plain edition
    /// identifier is rejected rather than escaped, because there is no
    /// legitimate reason for one to contain other characters; and an identifier
    /// we have not verified is rejected too, because building a URL for it would
    /// hand the browser a link that 404s halfway through a recitation.
    /// </summary>
    public string Normalise(string? reciter)
    {
        if (string.IsNullOrWhiteSpace(reciter))
        {
            return _options.DefaultReciter;
        }

        var trimmed = reciter.Trim();

        if (!EditionIdentifier().IsMatch(trimmed))
        {
            throw new RequestValidationException(
                "Reciter must be an edition identifier such as 'ar.alafasy'.",
                nameof(reciter));
        }

        if (!Reciters.IsSupported(trimmed))
        {
            throw new RequestValidationException(
                $"'{trimmed}' is not one of the reciters this API serves. "
                + "Call /api/quran/reciters for the list.",
                nameof(reciter));
        }

        return trimmed;
    }

    [GeneratedRegex(@"^[a-zA-Z0-9._-]{2,48}$", RegexOptions.CultureInvariant)]
    private static partial Regex EditionIdentifier();
}
