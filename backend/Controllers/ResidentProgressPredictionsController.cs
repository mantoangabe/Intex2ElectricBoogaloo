using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class ResidentProgressPredictionsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public ResidentProgressPredictionsController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResidentProgressPrediction>>> Get(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50000,
        [FromQuery] bool latestOnly = true,
        [FromQuery] double? minProbability = null,
        [FromQuery] string sort = "score_desc")
    {
        var q = _context.ResidentProgressPredictions.AsQueryable();

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
            q = q.Where(x => x.LowProgressRiskProbability >= minProbability.Value);
        }

        q = sort switch
        {
            "score_asc" => q.OrderBy(x => x.LowProgressRiskProbability),
            "asof_desc" => q.OrderByDescending(x => x.AsOfDate),
            "asof_asc" => q.OrderBy(x => x.AsOfDate),
            _ => q.OrderByDescending(x => x.LowProgressRiskProbability),
        };

        return await q.Skip(skip).Take(take).ToListAsync();
    }

    [HttpGet("meta/latest")]
    public async Task<ActionResult<object>> LatestMeta()
    {
        var latest = await _context.ResidentProgressPredictions
            .OrderByDescending(x => x.ScoredAt)
            .Select(x => new { x.ScoredAt, x.ModelVersion })
            .FirstOrDefaultAsync();

        return latest is null ? NotFound() : Ok(latest);
    }
}
