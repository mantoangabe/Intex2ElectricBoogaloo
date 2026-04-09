using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SafehouseMonthlyMetricsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public SafehouseMonthlyMetricsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/SafehouseMonthlyMetrics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SafehouseMonthlyMetric>>> GetSafehouseMonthlyMetrics(
            [FromQuery] int skip = 0,
            [FromQuery] int take = 25,
            [FromQuery] int? safehouseId = null)
        {
            var q = _context.SafehouseMonthlyMetrics.AsQueryable();

            if (safehouseId.HasValue)
            {
                q = q.Where(x => x.SafehouseId == safehouseId.Value);
            }

            return await q
                .OrderByDescending(x => x.MonthStart)
                .ThenBy(x => x.SafehouseId)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        /// <summary>
        /// One row per safehouse for a calendar month. Uses stored safehouse_monthly_metrics when present;
        /// fills missing education/health averages from education_records and health_wellbeing_records;
        /// estimates active residents from resident admission/closure dates when no row exists.
        /// </summary>
        // GET: api/SafehouseMonthlyMetrics/month-summary?monthStart=2026-01-01
        // or: month-summary?year=2025&month=6
        [HttpGet("month-summary")]
        public async Task<ActionResult<IEnumerable<SafehouseMonthSummaryDto>>> GetMonthSummary(
            [FromQuery(Name = "monthStart")] string? monthStartQuery = null,
            [FromQuery] int? year = null,
            [FromQuery] int? month = null)
        {
            DateTime periodStart;
            if (!string.IsNullOrWhiteSpace(monthStartQuery))
            {
                if (!DateTime.TryParse(monthStartQuery, out var parsed))
                {
                    return BadRequest("monthStart must be a valid date (e.g. yyyy-MM-dd).");
                }

                periodStart = new DateTime(parsed.Year, parsed.Month, 1, 0, 0, 0, DateTimeKind.Unspecified);
            }
            else if (year.HasValue && month.HasValue)
            {
                if (month.Value is < 1 or > 12)
                {
                    return BadRequest("month must be 1–12.");
                }

                periodStart = new DateTime(year.Value, month.Value, 1, 0, 0, 0, DateTimeKind.Unspecified);
            }
            else
            {
                return BadRequest("Provide monthStart (first day of month, e.g. 2026-01-01) or both year and month.");
            }

            var monthEndExclusive = periodStart.AddMonths(1);
            var monthEnd = monthEndExclusive.AddDays(-1);

            var safehouses = await _context.Safehouses
                .OrderBy(s => s.SafehouseId)
                .ToListAsync();

            var metricsForMonth = await _context.SafehouseMonthlyMetrics
                .Where(m => m.MonthStart.Year == periodStart.Year && m.MonthStart.Month == periodStart.Month)
                .ToListAsync();

            var result = new List<SafehouseMonthSummaryDto>(safehouses.Count);

            foreach (var sh in safehouses)
            {
                var stored = metricsForMonth.FirstOrDefault(m => m.SafehouseId == sh.SafehouseId);

                var residentIds = await _context.Residents
                    .Where(r => r.SafehouseId == sh.SafehouseId)
                    .Select(r => r.ResidentId)
                    .ToListAsync();

                var computedActive = await _context.Residents
                    .CountAsync(r =>
                        r.SafehouseId == sh.SafehouseId
                        && r.DateOfAdmission <= monthEnd
                        && (r.DateClosed == null || r.DateClosed >= periodStart));

                decimal? computedEd = null;
                var edQ = _context.EducationRecords
                    .Where(e =>
                        residentIds.Contains(e.ResidentId)
                        && e.RecordDate >= periodStart
                        && e.RecordDate < monthEndExclusive);
                if (await edQ.AnyAsync())
                {
                    computedEd = await edQ.AverageAsync(e => (decimal?)e.ProgressPercent);
                }

                decimal? computedHealth = null;
                var hwQ = _context.HealthWellbeingRecords
                    .Where(h =>
                        residentIds.Contains(h.ResidentId)
                        && h.RecordDate >= periodStart
                        && h.RecordDate < monthEndExclusive);
                if (await hwQ.AnyAsync())
                {
                    computedHealth = await hwQ.AverageAsync(h => (decimal?)h.GeneralHealthScore);
                }

                var active = stored != null ? stored.ActiveResidents : computedActive;
                var avgEd = stored?.AvgEducationProgress;
                if (avgEd == null)
                {
                    avgEd = computedEd;
                }

                var avgHealth = stored?.AvgHealthScore;
                if (avgHealth == null)
                {
                    avgHealth = computedHealth;
                }

                result.Add(new SafehouseMonthSummaryDto
                {
                    SafehouseId = sh.SafehouseId,
                    SafehouseName = string.IsNullOrWhiteSpace(sh.Name) ? $"Safehouse {sh.SafehouseId}" : sh.Name,
                    MonthStart = periodStart.ToString("yyyy-MM-dd"),
                    MonthEnd = monthEnd.ToString("yyyy-MM-dd"),
                    MetricId = stored?.MetricId,
                    ActiveResidents = active,
                    AvgEducationProgress = avgEd,
                    AvgHealthScore = avgHealth,
                });
            }

            return result;
        }

        // GET: api/SafehouseMonthlyMetrics/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SafehouseMonthlyMetric>> GetSafehouseMonthlyMetric(int id)
        {
            var safehouseMonthlyMetric = await _context.SafehouseMonthlyMetrics.FindAsync(id);

            if (safehouseMonthlyMetric == null)
            {
                return NotFound();
            }

            return safehouseMonthlyMetric;
        }

        // PUT: api/SafehouseMonthlyMetrics/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafehouseMonthlyMetric(int id, SafehouseMonthlyMetric safehouseMonthlyMetric)
        {
            if (id != safehouseMonthlyMetric.MetricId)
            {
                return BadRequest();
            }

            _context.Entry(safehouseMonthlyMetric).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SafehouseMonthlyMetricExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SafehouseMonthlyMetrics
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SafehouseMonthlyMetric>> PostSafehouseMonthlyMetric(SafehouseMonthlyMetric safehouseMonthlyMetric)
        {
            _context.SafehouseMonthlyMetrics.Add(safehouseMonthlyMetric);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSafehouseMonthlyMetric", new { id = safehouseMonthlyMetric.MetricId }, safehouseMonthlyMetric);
        }

        // DELETE: api/SafehouseMonthlyMetrics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSafehouseMonthlyMetric(int id)
        {
            var safehouseMonthlyMetric = await _context.SafehouseMonthlyMetrics.FindAsync(id);
            if (safehouseMonthlyMetric == null)
            {
                return NotFound();
            }

            _context.SafehouseMonthlyMetrics.Remove(safehouseMonthlyMetric);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SafehouseMonthlyMetricExists(int id)
        {
            return _context.SafehouseMonthlyMetrics.Any(e => e.MetricId == id);
        }
    }
}


