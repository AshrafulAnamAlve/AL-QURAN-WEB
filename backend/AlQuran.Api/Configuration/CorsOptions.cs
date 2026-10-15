namespace AlQuran.Api.Configuration;

/// <summary>Which browser origins may call this API. Bound from the "Cors" section.</summary>
public sealed class CorsOptions
{
    public const string SectionName = "Cors";
    public const string PolicyName = "AlQuranFrontend";

    /// <summary>
    /// Exact origins allowed to call the API (scheme + host + port, no trailing slash).
    /// Wildcard origins are deliberately not supported.
    /// </summary>
    public IList<string> AllowedOrigins { get; set; } = [];
}
