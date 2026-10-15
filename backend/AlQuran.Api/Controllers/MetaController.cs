using AlQuran.Api.DTOs.Meta;
using AlQuran.Api.Services.Abstractions;
using Microsoft.AspNetCore.Mvc;

namespace AlQuran.Api.Controllers;

/// <summary>Information about this backend and the free APIs behind it.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class MetaController : ControllerBase
{
    private readonly IMetaService _metaService;

    public MetaController(IMetaService metaService)
    {
        _metaService = metaService;
    }

    /// <summary>
    /// App name, version, environment, server clock and the full catalogue of
    /// external APIs (including whether each one needs a key and whether one is set).
    /// </summary>
    /// <response code="200">Application information.</response>
    [HttpGet]
    [ProducesResponseType<AppInfoDto>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any)]
    public ActionResult<AppInfoDto> Get() => Ok(_metaService.GetAppInfo());
}
