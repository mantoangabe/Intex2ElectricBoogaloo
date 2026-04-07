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
    public class InterventionPlansController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public InterventionPlansController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/InterventionPlans
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterventionPlan>>> GetInterventionPlans()
        {
            return await _context.InterventionPlans.ToListAsync();
        }

        // GET: api/InterventionPlans/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InterventionPlan>> GetInterventionPlan(int id)
        {
            var interventionPlan = await _context.InterventionPlans.FindAsync(id);

            if (interventionPlan == null)
            {
                return NotFound();
            }

            return interventionPlan;
        }

        // PUT: api/InterventionPlans/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInterventionPlan(int id, InterventionPlan interventionPlan)
        {
            if (id != interventionPlan.PlanId)
            {
                return BadRequest();
            }

            _context.Entry(interventionPlan).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InterventionPlanExists(id))
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

        // POST: api/InterventionPlans
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<InterventionPlan>> PostInterventionPlan(InterventionPlan interventionPlan)
        {
            _context.InterventionPlans.Add(interventionPlan);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInterventionPlan", new { id = interventionPlan.PlanId }, interventionPlan);
        }

        // DELETE: api/InterventionPlans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterventionPlan(int id)
        {
            var interventionPlan = await _context.InterventionPlans.FindAsync(id);
            if (interventionPlan == null)
            {
                return NotFound();
            }

            _context.InterventionPlans.Remove(interventionPlan);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InterventionPlanExists(int id)
        {
            return _context.InterventionPlans.Any(e => e.PlanId == id);
        }
    }
}
