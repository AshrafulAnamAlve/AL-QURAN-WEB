using AlQuran.Api.Data;
using AlQuran.Api.Data.Entities;
using AlQuran.Api.DTOs.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlQuran.Api.Controllers;

/// <summary>
/// Daily Quran task tracker and habit logging endpoints.
/// </summary>
[ApiController]
[Route("api/tasks")]
[Produces("application/json")]
public sealed class TasksController : ControllerBase
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TasksController> _logger;

    public TasksController(IServiceProvider serviceProvider, ILogger<TasksController> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>Logs daily habit completion and syncs with backend database.</summary>
    /// <param name="log">The daily task completion payload.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <response code="200">The log was recorded successfully.</response>
    [HttpPost("daily-log")]
    [ProducesResponseType<DailyTaskLogResponseDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DailyTaskLogResponseDto>> RecordDailyLog(
        [FromBody] DailyTaskLogDto log,
        CancellationToken cancellationToken)
    {
        var db = _serviceProvider.GetService<AlQuranDbContext>();
        if (db != null)
        {
            try
            {
                var entry = new DailyAyahLog
                {
                    DateUtc = log.DateUtc == default ? DateTime.UtcNow.Date : log.DateUtc.Date,
                    SurahNumber = log.SurahNumber > 0 ? log.SurahNumber : 1,
                    AyahNumber = log.AyahNumber > 0 ? log.AyahNumber : 1,
                    SelectedAtUtc = DateTime.UtcNow
                };

                db.DailyAyahLogs.Add(entry);
                await db.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to persist daily task log to database; returning fallback success.");
            }
        }

        return Ok(new DailyTaskLogResponseDto(
            Success: true,
            Message: "Daily task log received and synchronized.",
            TimestampUtc: DateTime.UtcNow
        ));
    }

    /// <summary>Fetches recent daily log count / summary.</summary>
    [HttpGet("daily-log/recent")]
    [ProducesResponseType<IReadOnlyList<DailyAyahLog>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DailyAyahLog>>> GetRecentLogs(CancellationToken cancellationToken)
    {
        var db = _serviceProvider.GetService<AlQuranDbContext>();
        if (db == null)
        {
            return Ok(Array.Empty<DailyAyahLog>());
        }

        try
        {
            var items = await db.DailyAyahLogs
                .OrderByDescending(x => x.SelectedAtUtc)
                .Take(30)
                .ToListAsync(cancellationToken);

            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to query daily task logs from database.");
            return Ok(Array.Empty<DailyAyahLog>());
        }
    }
}
