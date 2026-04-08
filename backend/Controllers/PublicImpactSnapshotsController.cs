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
    public class PublicImpactSnapshotsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public PublicImpactSnapshotsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/PublicImpactSnapshots
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PublicImpactSnapshot>>> GetPublicImpactSnapshots([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.PublicImpactSnapshots.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/PublicImpactSnapshots/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicImpactSnapshot>> GetPublicImpactSnapshot(int id)
        {
            var publicImpactSnapshot = await _context.PublicImpactSnapshots.FindAsync(id);

            if (publicImpactSnapshot == null)
            {
                return NotFound();
            }

            return publicImpactSnapshot;
        }

        // PUT: api/PublicImpactSnapshots/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPublicImpactSnapshot(int id, PublicImpactSnapshot publicImpactSnapshot)
        {
            if (id != publicImpactSnapshot.SnapshotId)
            {
                return BadRequest();
            }

            _context.Entry(publicImpactSnapshot).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PublicImpactSnapshotExists(id))
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

        // POST: api/PublicImpactSnapshots
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PublicImpactSnapshot>> PostPublicImpactSnapshot(PublicImpactSnapshot publicImpactSnapshot)
        {
            _context.PublicImpactSnapshots.Add(publicImpactSnapshot);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPublicImpactSnapshot", new { id = publicImpactSnapshot.SnapshotId }, publicImpactSnapshot);
        }

        // DELETE: api/PublicImpactSnapshots/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePublicImpactSnapshot(int id)
        {
            var publicImpactSnapshot = await _context.PublicImpactSnapshots.FindAsync(id);
            if (publicImpactSnapshot == null)
            {
                return NotFound();
            }

            _context.PublicImpactSnapshots.Remove(publicImpactSnapshot);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PublicImpactSnapshotExists(int id)
        {
            return _context.PublicImpactSnapshots.Any(e => e.SnapshotId == id);
        }
    }
}


