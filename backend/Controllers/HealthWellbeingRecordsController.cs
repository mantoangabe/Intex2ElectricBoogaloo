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
    public class HealthWellbeingRecordsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public HealthWellbeingRecordsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/HealthWellbeingRecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HealthWellbeingRecord>>> GetHealthWellbeingRecords([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.HealthWellbeingRecords.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/HealthWellbeingRecords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HealthWellbeingRecord>> GetHealthWellbeingRecord(int id)
        {
            var healthWellbeingRecord = await _context.HealthWellbeingRecords.FindAsync(id);

            if (healthWellbeingRecord == null)
            {
                return NotFound();
            }

            return healthWellbeingRecord;
        }

        // PUT: api/HealthWellbeingRecords/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHealthWellbeingRecord(int id, HealthWellbeingRecord healthWellbeingRecord)
        {
            if (id != healthWellbeingRecord.HealthRecordId)
            {
                return BadRequest();
            }

            _context.Entry(healthWellbeingRecord).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HealthWellbeingRecordExists(id))
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

        // POST: api/HealthWellbeingRecords
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<HealthWellbeingRecord>> PostHealthWellbeingRecord(HealthWellbeingRecord healthWellbeingRecord)
        {
            _context.HealthWellbeingRecords.Add(healthWellbeingRecord);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHealthWellbeingRecord", new { id = healthWellbeingRecord.HealthRecordId }, healthWellbeingRecord);
        }

        // DELETE: api/HealthWellbeingRecords/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHealthWellbeingRecord(int id)
        {
            var healthWellbeingRecord = await _context.HealthWellbeingRecords.FindAsync(id);
            if (healthWellbeingRecord == null)
            {
                return NotFound();
            }

            _context.HealthWellbeingRecords.Remove(healthWellbeingRecord);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HealthWellbeingRecordExists(int id)
        {
            return _context.HealthWellbeingRecords.Any(e => e.HealthRecordId == id);
        }
    }
}
