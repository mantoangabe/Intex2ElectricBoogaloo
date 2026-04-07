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
    public class EducationRecordsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public EducationRecordsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/EducationRecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EducationRecord>>> GetEducationRecords()
        {
            return await _context.EducationRecords.ToListAsync();
        }

        // GET: api/EducationRecords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EducationRecord>> GetEducationRecord(int id)
        {
            var educationRecord = await _context.EducationRecords.FindAsync(id);

            if (educationRecord == null)
            {
                return NotFound();
            }

            return educationRecord;
        }

        // PUT: api/EducationRecords/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEducationRecord(int id, EducationRecord educationRecord)
        {
            if (id != educationRecord.EducationRecordId)
            {
                return BadRequest();
            }

            _context.Entry(educationRecord).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EducationRecordExists(id))
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

        // POST: api/EducationRecords
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EducationRecord>> PostEducationRecord(EducationRecord educationRecord)
        {
            _context.EducationRecords.Add(educationRecord);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEducationRecord", new { id = educationRecord.EducationRecordId }, educationRecord);
        }

        // DELETE: api/EducationRecords/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEducationRecord(int id)
        {
            var educationRecord = await _context.EducationRecords.FindAsync(id);
            if (educationRecord == null)
            {
                return NotFound();
            }

            _context.EducationRecords.Remove(educationRecord);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EducationRecordExists(int id)
        {
            return _context.EducationRecords.Any(e => e.EducationRecordId == id);
        }
    }
}
