namespace AlQuran.Api.DTOs.Meta;

/// <summary>What the frontend needs to know about this backend at runtime.</summary>
/// <param name="Name">Application display name.</param>
/// <param name="Version">Assembly version.</param>
/// <param name="Environment">Development / Staging / Production.</param>
/// <param name="ServerTimeUtc">Server clock, useful for debugging countdown drift.</param>
/// <param name="ExternalApis">Catalogue of every third-party API in use.</param>
public sealed record AppInfoDto(
    string Name,
    string Version,
    string Environment,
    DateTimeOffset ServerTimeUtc,
    IReadOnlyList<ExternalApiInfoDto> ExternalApis);

/// <summary>One entry in the external API catalogue.</summary>
/// <param name="Key">Configuration key under ExternalApis.</param>
/// <param name="DisplayName">Provider name.</param>
/// <param name="Purpose">What this project uses it for.</param>
/// <param name="BaseUrl">Root URL currently configured.</param>
/// <param name="DocsUrl">Where to read the provider documentation.</param>
/// <param name="IsFree">Whether the provider is free to use.</param>
/// <param name="RequiresApiKey">Whether a key must be supplied for it to work.</param>
/// <param name="ApiKeyConfigured">Whether a key is present in configuration.</param>
/// <param name="Enabled">Whether this project is currently allowed to call it.</param>
public sealed record ExternalApiInfoDto(
    string Key,
    string DisplayName,
    string Purpose,
    string BaseUrl,
    string DocsUrl,
    bool IsFree,
    bool RequiresApiKey,
    bool ApiKeyConfigured,
    bool Enabled);
