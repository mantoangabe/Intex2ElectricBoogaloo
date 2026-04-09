using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class DonorRetentionPredictionsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public DonorRetentionPredictionsController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DonorRetentionPrediction>>> Get(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50000,
        [FromQuery] bool latestOnly = true,
        [FromQuery] double? minProbability = null,
        [FromQuery] string sort = "score_desc")
    {
        var q = _context.DonorRetentionPredictions.AsQueryable();

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
            q = q.Where(x => x.LapseRiskProbability >= minProbability.Value);
        }

        q = sort switch
        {
            "score_asc" => q.OrderBy(x => x.LapseRiskProbability),
            "asof_desc" => q.OrderByDescending(x => x.AsOfDate),
            "asof_asc" => q.OrderBy(x => x.AsOfDate),
            _ => q.OrderByDescending(x => x.LapseRiskProbability),
        };

        return await q.Skip(skip).Take(take).ToListAsync();
    }

    [HttpGet("meta/latest")]
    public async Task<ActionResult<object>> LatestMeta()
    {
        var latest = await _context.DonorRetentionPredictions
            .OrderByDescending(x => x.ScoredAt)
            .Select(x => new { x.ScoredAt, x.ModelVersion })
            .FirstOrDefaultAsync();

        return latest is null ? NotFound() : Ok(latest);
    }
}
