using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>
/// Recitation audio CDN (islamic.network). Audio is streamed straight from the CDN
/// by the browser - the backend only builds and validates the URLs.
/// </summary>
public sealed class QuranAudioOptions : ExternalApiOptions
{
    public const string SectionName = "ExternalApis:QuranAudio";

    /// <summary>Default reciter edition identifier.</summary>
    [Required]
    public string DefaultReciter { get; set; } = "ar.alafasy";

    /// <summary>
    /// Fallback audio bitrate folder on the CDN (32, 40, 48, 64, 128 or 192).
    ///
    /// The real bitrate is per reciter and lives in Services/Quran/Reciters.cs,
    /// because the CDN stores each edition only under the bitrates it was
    /// encoded at. This value is used only for an identifier with no entry there.
    /// </summary>
    [Range(32, 192)]
    public int Bitrate { get; set; } = 128;
}
