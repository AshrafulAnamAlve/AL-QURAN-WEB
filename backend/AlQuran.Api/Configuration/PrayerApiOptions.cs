using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>Prayer times, Hijri calendar and Ramadan data (Aladhan API).</summary>
public sealed class PrayerApiOptions : ExternalApiOptions
{
    public const string SectionName = "ExternalApis:PrayerApi";

    /// <summary>
    /// Aladhan calculation method id. 1 = University of Islamic Sciences, Karachi,
    /// the method commonly used across Bangladesh and South Asia.
    /// Users can override this per request from the Settings page.
    /// </summary>
    [Range(0, 99)]
    public int DefaultMethod { get; set; } = 1;

    /// <summary>Asr juristic school: 0 = Shafi/standard, 1 = Hanafi.</summary>
    [Range(0, 1)]
    public int DefaultSchool { get; set; } = 1;
}
