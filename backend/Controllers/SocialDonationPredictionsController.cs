using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class SocialDonationPredictionsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public SocialDonationPredictionsController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SocialDonationPrediction>>> Get(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 25,
        [FromQuery] bool latestOnly = true,
        [FromQuery] double? minPredictedValue = null,
        [FromQuery] string sort = "value_desc")
    {
        var q = _context.SocialDonationPredictions.AsQueryable();

        if (latestOnly)
        {
            var latest = await q.MaxAsync(x => (DateTime?)x.ScoredAt);
            if (latest.HasValue)
            {
                q = q.Where(x => x.ScoredAt == latest.Value);
            }
        }

        if (minPredictedValue.HasValue)
        {
            q = q.Where(x => x.PredictedDonationValuePhp >= minPredictedValue.Value);
        }

        q = sort switch
        {
            "value_asc" => q.OrderBy(x => x.PredictedDonationValuePhp),
            "asof_desc" => q.OrderByDescending(x => x.AsOfDate),
            "asof_asc" => q.OrderBy(x => x.AsOfDate),
            _ => q.OrderByDescending(x => x.PredictedDonationValuePhp),
        };

        return await q.Skip(skip).Take(take).ToListAsync();
    }

    [HttpGet("meta/latest")]
    public async Task<ActionResult<object>> LatestMeta()
    {
        var latest = await _context.SocialDonationPredictions
            .OrderByDescending(x => x.ScoredAt)
            .Select(x => new { x.ScoredAt, x.ModelVersion })
            .FirstOrDefaultAsync();

        return latest is null ? NotFound() : Ok(latest);
    }

    [HttpPost("refresh-demo")]
    public async Task<ActionResult<object>> RefreshDemoScoring()
    {
        var total = await PredictionSeedService.RefreshSocialDonationPredictionsAsync(_context);
        var latest = await _context.SocialDonationPredictions
            .OrderByDescending(x => x.ScoredAt)
            .Select(x => new { x.ScoredAt, x.ModelVersion })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            message = "Social donation predictions refreshed.",
            totalRows = total,
            latest
        });
    }
}
