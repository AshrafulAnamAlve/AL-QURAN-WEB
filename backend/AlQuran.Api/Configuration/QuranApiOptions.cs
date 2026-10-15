using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>Quran text, metadata, translations and search (AlQuran.cloud).</summary>
public sealed class QuranApiOptions : ExternalApiOptions
{
    public const string SectionName = "ExternalApis:QuranApi";

    /// <summary>Edition identifier for the Arabic script (Uthmani).</summary>
    [Required]
    public string ArabicEdition { get; set; } = "quran-uthmani";

    /// <summary>Default Bangla translation edition identifier.</summary>
    [Required]
    public string BanglaEdition { get; set; } = "bn.bengali";

    /// <summary>Default English translation edition identifier.</summary>
    [Required]
    public string EnglishEdition { get; set; } = "en.sahih";
}
