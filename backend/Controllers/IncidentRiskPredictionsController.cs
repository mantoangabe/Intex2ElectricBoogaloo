using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class IncidentRiskPredictionsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public IncidentRiskPredictionsController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncidentRiskPrediction>>> Get(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 25,
        [FromQuery] bool latestOnly = true,
        [FromQuery] double? minProbability = null,
        [FromQuery] string sort = "score_desc")
    {
        var q = _context.IncidentRiskPredictions.AsQueryable();

        if (latestOnly)
        {
            var latest = await q.MaxAsync(x => (DateTime?)x.ScoredAt);
            if (latest.HasValue)
            {
                q = q.Where(x => x.ScoredAt == latest.Value);
            }
        }

        if (minProbability.HasValue)
        {
            q = q.Where(x => x.IncidentRiskProbability >= minProbability.Value);
        }

        q = sort switch
        {
            "score_asc" => q.OrderBy(x => x.IncidentRiskProbability),
            "asof_desc" => q.OrderByDescending(x => x.AsOfDate),
            "asof_asc" => q.OrderBy(x => x.AsOfDate),
            _ => q.OrderByDescending(x => x.IncidentRiskProbability),
        };

        return await q.Skip(skip).Take(take).ToListAsync();
    }

    [HttpGet("meta/latest")]
    public async Task<ActionResult<object>> LatestMeta()
    {
        var latest = await _context.IncidentRiskPredictions
            .OrderByDescending(x => x.ScoredAt)
            .Select(x => new { x.ScoredAt, x.ModelVersion })
            .FirstOrDefaultAsync();

        return latest is null ? NotFound() : Ok(latest);
    }
}
