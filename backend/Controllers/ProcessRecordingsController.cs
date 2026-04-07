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
    public class ProcessRecordingsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public ProcessRecordingsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/ProcessRecordings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcessRecording>>> GetProcessRecordings([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.ProcessRecordings.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/ProcessRecordings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProcessRecording>> GetProcessRecording(int id)
        {
            var processRecording = await _context.ProcessRecordings.FindAsync(id);

            if (processRecording == null)
            {
                return NotFound();
            }

            return processRecording;
        }

        // PUT: api/ProcessRecordings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProcessRecording(int id, ProcessRecording processRecording)
        {
            if (id != processRecording.RecordingId)
            {
                return BadRequest();
            }

            _context.Entry(processRecording).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProcessRecordingExists(id))
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

        // POST: api/ProcessRecordings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProcessRecording>> PostProcessRecording(ProcessRecording processRecording)
        {
            _context.ProcessRecordings.Add(processRecording);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProcessRecording", new { id = processRecording.RecordingId }, processRecording);
        }

        // DELETE: api/ProcessRecordings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProcessRecording(int id)
        {
            var processRecording = await _context.ProcessRecordings.FindAsync(id);
            if (processRecording == null)
            {
                return NotFound();
            }

            _context.ProcessRecordings.Remove(processRecording);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProcessRecordingExists(int id)
        {
            return _context.ProcessRecordings.Any(e => e.RecordingId == id);
        }
    }
}
