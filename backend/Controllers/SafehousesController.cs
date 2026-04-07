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
    public class SafehousesController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public SafehousesController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/Safehouses?name=Alpha
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Safehouse>>> GetSafehouses([FromQuery] string? name)
        {
            IQueryable<Safehouse> query = _context.Safehouses;

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(s => s.Name.ToLower().Contains(name.ToLower()));
            }

            return await query.ToListAsync();
        }

        // GET: api/Safehouses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Safehouse>> GetSafehouse(int id)
        {
            var safehouse = await _context.Safehouses.FindAsync(id);

            if (safehouse == null)
            {
                return NotFound();
            }

            return safehouse;
        }

        // PUT: api/Safehouses/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafehouse(int id, Safehouse safehouse)
        {
            if (id != safehouse.SafehouseId)
            {
                return BadRequest();
            }

            _context.Entry(safehouse).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SafehouseExists(id))
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

        // POST: api/Safehouses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Safehouse>> PostSafehouse(Safehouse safehouse)
        {
            _context.Safehouses.Add(safehouse);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSafehouse", new { id = safehouse.SafehouseId }, safehouse);
        }

        // DELETE: api/Safehouses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSafehouse(int id)
        {
            var safehouse = await _context.Safehouses.FindAsync(id);
            if (safehouse == null)
            {
                return NotFound();
            }

            _context.Safehouses.Remove(safehouse);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SafehouseExists(int id)
        {
            return _context.Safehouses.Any(e => e.SafehouseId == id);
        }
    }
}
