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
    public class SupportersController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public SupportersController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/Supporters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supporter>>> GetSupporters([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.Supporters.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/Supporters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Supporter>> GetSupporter(int id)
        {
            var supporter = await _context.Supporters.FindAsync(id);

            if (supporter == null)
            {
                return NotFound();
            }

            return supporter;
        }

        // PUT: api/Supporters/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupporter(int id, Supporter supporter)
        {
            if (id != supporter.SupporterId)
            {
                return BadRequest();
            }

            _context.Entry(supporter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupporterExists(id))
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

        // POST: api/Supporters
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Supporter>> PostSupporter(Supporter supporter)
        {
            _context.Supporters.Add(supporter);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSupporter", new { id = supporter.SupporterId }, supporter);
        }

        // DELETE: api/Supporters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupporter(int id)
        {
            var supporter = await _context.Supporters.FindAsync(id);
            if (supporter == null)
            {
                return NotFound();
            }

            _context.Supporters.Remove(supporter);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SupporterExists(int id)
        {
            return _context.Supporters.Any(e => e.SupporterId == id);
        }
    }
}
