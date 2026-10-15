namespace AlQuran.Api.Models.Upstream.AlQuranCloud;

/// <summary>GET /search/{term}/{surah|all}/{edition}.</summary>
public sealed class UpstreamSearchData
{
    /// <summary>Total matches the provider found, which can exceed what it returns.</summary>
    public int Count { get; set; }

    public List<UpstreamSearchMatch> Matches { get; set; } = [];
}

/// <summary>One search hit.</summary>
public sealed class UpstreamSearchMatch
{
    /// <summary>Global ayah number, 1 to 6236.</summary>
    public int Number { get; set; }

    /// <summary>The matched text, in the edition that was searched.</summary>
    public string Text { get; set; } = string.Empty;

    public int NumberInSurah { get; set; }

    public UpstreamSurahSummary? Surah { get; set; }

    public UpstreamEdition? Edition { get; set; }
}
