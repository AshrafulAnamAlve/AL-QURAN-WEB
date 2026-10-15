using AlQuran.Api.DTOs.Common;
using AlQuran.Api.DTOs.Meta;

namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Describes this backend and the third-party APIs behind it, and can verify
/// that those APIs are actually reachable right now.
/// </summary>
public interface IMetaService
{
    /// <summary>Application details plus the external API catalogue.</summary>
    AppInfoDto GetAppInfo();

    /// <summary>Liveness of this process only - no network calls.</summary>
    HealthDto GetHealth();

    /// <summary>Pings every enabled upstream API in parallel and reports the outcome.</summary>
    Task<UpstreamHealthReportDto> CheckUpstreamsAsync(CancellationToken cancellationToken = default);
}
