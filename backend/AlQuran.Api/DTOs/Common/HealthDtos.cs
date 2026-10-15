namespace AlQuran.Api.DTOs.Common;

/// <summary>Result of a liveness check on this backend.</summary>
/// <param name="Status">"Healthy" or "Degraded".</param>
/// <param name="CheckedAtUtc">When the check ran.</param>
/// <param name="UptimeSeconds">How long the process has been running.</param>
public sealed record HealthDto(string Status, DateTimeOffset CheckedAtUtc, double UptimeSeconds);

/// <summary>Connectivity result for a single upstream API.</summary>
/// <param name="Key">Configuration key under ExternalApis.</param>
/// <param name="DisplayName">Provider name.</param>
/// <param name="Healthy">True when the provider answered successfully.</param>
/// <param name="StatusCode">HTTP status the provider returned, when there was one.</param>
/// <param name="LatencyMs">Round-trip time in milliseconds.</param>
/// <param name="Message">Human readable outcome.</param>
public sealed record UpstreamHealthDto(
    string Key,
    string DisplayName,
    bool Healthy,
    int? StatusCode,
    long LatencyMs,
    string Message);

/// <summary>Aggregated upstream connectivity report.</summary>
/// <param name="Status">"Healthy" when every upstream answered, otherwise "Degraded".</param>
/// <param name="CheckedAtUtc">When the checks ran.</param>
/// <param name="Upstreams">Per-provider results.</param>
public sealed record UpstreamHealthReportDto(
    string Status,
    DateTimeOffset CheckedAtUtc,
    IReadOnlyList<UpstreamHealthDto> Upstreams);
