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
    public class PartnerAssignmentsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public PartnerAssignmentsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/PartnerAssignments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartnerAssignment>>> GetPartnerAssignments([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.PartnerAssignments.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/PartnerAssignments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PartnerAssignment>> GetPartnerAssignment(int id)
        {
            var partnerAssignment = await _context.PartnerAssignments.FindAsync(id);

            if (partnerAssignment == null)
            {
                return NotFound();
            }

            return partnerAssignment;
        }

        // PUT: api/PartnerAssignments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPartnerAssignment(int id, PartnerAssignment partnerAssignment)
        {
            if (id != partnerAssignment.AssignmentId)
            {
                return BadRequest();
            }

            _context.Entry(partnerAssignment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PartnerAssignmentExists(id))
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

        // POST: api/PartnerAssignments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PartnerAssignment>> PostPartnerAssignment(PartnerAssignment partnerAssignment)
        {
            _context.PartnerAssignments.Add(partnerAssignment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPartnerAssignment", new { id = partnerAssignment.AssignmentId }, partnerAssignment);
        }

        // DELETE: api/PartnerAssignments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePartnerAssignment(int id)
        {
            var partnerAssignment = await _context.PartnerAssignments.FindAsync(id);
            if (partnerAssignment == null)
            {
                return NotFound();
            }

            _context.PartnerAssignments.Remove(partnerAssignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PartnerAssignmentExists(int id)
        {
            return _context.PartnerAssignments.Any(e => e.AssignmentId == id);
        }
    }
}


