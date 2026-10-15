namespace AlQuran.Api.Models.Upstream.AlQuranCloud;

/// <summary>
/// GET /juz/{n}/{edition}.
/// Note: unlike /surah, the juz endpoint accepts only ONE edition per call
/// (asking for several returns 404), so the service fetches Arabic and each
/// translation separately and joins them on the global ayah number.
/// </summary>
public sealed class UpstreamJuz
{
    public int Number { get; set; }

    public List<UpstreamAyah> Ayahs { get; set; } = [];

    public UpstreamEdition? Edition { get; set; }
}
