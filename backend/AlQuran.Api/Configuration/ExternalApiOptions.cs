using System.ComponentModel.DataAnnotations;

namespace AlQuran.Api.Configuration;

/// <summary>
/// Settings shared by every external (third-party) API this backend talks to.
/// Bound from the "ExternalApis:*" section of appsettings.json.
/// </summary>
public class ExternalApiOptions
{
    /// <summary>Human readable name, used in logs and error messages.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Root URL of the upstream API. Must end with a trailing slash.</summary>
    [Required(AllowEmptyStrings = false)]
    [Url]
    public string BaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Optional API key. Every API used by this project is currently key-free,
    /// so this stays empty unless you swap in a provider that requires one.
    /// NEVER commit a real key here - use user-secrets or an environment variable.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>How long a single upstream request may take before we give up.</summary>
    [Range(1, 120)]
    public int TimeoutSeconds { get; set; } = 20;

    /// <summary>Set to false to disable the feature that depends on this API.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>Documentation URL, surfaced by the /api/meta endpoint.</summary>
    public string DocsUrl { get; set; } = string.Empty;

    /// <summary>
    /// True when BaseUrl is one complete endpoint rather than a root that
    /// relative paths get appended to. Overpass works this way: there is a single
    /// /api/interpreter URL and adding a trailing slash breaks it.
    /// </summary>
    public bool IsSingleEndpoint { get; set; }

    /// <summary>True when a key has been supplied in configuration.</summary>
    public bool HasApiKey => !string.IsNullOrWhiteSpace(ApiKey);
}
