using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SafehouseMonthlyMetricsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public SafehouseMonthlyMetricsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/SafehouseMonthlyMetrics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SafehouseMonthlyMetric>>> GetSafehouseMonthlyMetrics()
        {
            return await _context.SafehouseMonthlyMetrics.ToListAsync();
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
