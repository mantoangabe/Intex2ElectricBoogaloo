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
    public class HomeVisitationsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public HomeVisitationsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/HomeVisitations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HomeVisitation>>> GetHomeVisitations([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.HomeVisitations.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/HomeVisitations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HomeVisitation>> GetHomeVisitation(int id)
        {
            var homeVisitation = await _context.HomeVisitations.FindAsync(id);

            if (homeVisitation == null)
            {
                return NotFound();
            }

            return homeVisitation;
        }

        // PUT: api/HomeVisitations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHomeVisitation(int id, HomeVisitation homeVisitation)
        {
            if (id != homeVisitation.VisitationId)
            {
                return BadRequest();
            }

            _context.Entry(homeVisitation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HomeVisitationExists(id))
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

        // POST: api/HomeVisitations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<HomeVisitation>> PostHomeVisitation(HomeVisitation homeVisitation)
        {
            _context.HomeVisitations.Add(homeVisitation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHomeVisitation", new { id = homeVisitation.VisitationId }, homeVisitation);
        }

        // DELETE: api/HomeVisitations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHomeVisitation(int id)
        {
            var homeVisitation = await _context.HomeVisitations.FindAsync(id);
            if (homeVisitation == null)
            {
                return NotFound();
            }

            _context.HomeVisitations.Remove(homeVisitation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HomeVisitationExists(int id)
        {
            return _context.HomeVisitations.Any(e => e.VisitationId == id);
        }
    }
}


