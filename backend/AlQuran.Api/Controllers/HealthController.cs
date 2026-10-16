using AlQuran.Api.DTOs.Common;
using AlQuran.Api.Extensions;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AlQuran.Api.Controllers;

/// <summary>Liveness and upstream connectivity checks.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class HealthController : ControllerBase
{
    private readonly IMetaService _metaService;

    public HealthController(IMetaService metaService)
    {
        _metaService = metaService;
    }

    /// <summary>Is the backend running? Does not touch the network.</summary>
    /// <response code="200">The API is alive.</response>
    [HttpGet]
    [ProducesResponseType<HealthDto>(StatusCodes.Status200OK)]
    public ActionResult<HealthDto> Get() => Ok(_metaService.GetHealth());

    /// <summary>
    /// Pings every third-party API this project depends on and reports which ones
    /// are reachable. Use this first whenever a feature stops loading.
    /// </summary>
    /// <response code="200">All upstreams answered.</response>
    /// <response code="503">At least one upstream is unreachable.</response>
    [HttpGet("upstreams")]
    [EnableRateLimiting(SecurityRegistration.ExpensivePolicy)]
    [ProducesResponseType<UpstreamHealthReportDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<UpstreamHealthReportDto>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<UpstreamHealthReportDto>> GetUpstreams(CancellationToken cancellationToken)
    {
        var report = await _metaService.CheckUpstreamsAsync(cancellationToken);

        return report.Status == "Healthy"
            ? Ok(report)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, report);
    }

    /// <summary>Checks database connectivity.</summary>
    [HttpGet("database")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetDatabaseHealth(
        [FromServices] AlQuran.Api.Data.AlQuranDbContext? dbContext,
        CancellationToken cancellationToken)
    {
        if (dbContext is null)
        {
            return Ok(new { status = "NotConfigured", message = "No database connection string configured." });
        }

        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
            return canConnect
                ? Ok(new { status = "Healthy", database = "db73976", server = "db73976.public.databaseasp.net" })
                : StatusCode(StatusCodes.Status503ServiceUnavailable, new { status = "Unhealthy", error = "Cannot connect to database" });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { status = "Unhealthy", error = ex.Message });
        }
    }
}
