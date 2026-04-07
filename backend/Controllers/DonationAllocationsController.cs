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
    public class DonationAllocationsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public DonationAllocationsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/DonationAllocations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationAllocation>>> GetDonationAllocations([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.DonationAllocations.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/DonationAllocations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DonationAllocation>> GetDonationAllocation(int id)
        {
            var donationAllocation = await _context.DonationAllocations.FindAsync(id);

            if (donationAllocation == null)
            {
                return NotFound();
            }

            return donationAllocation;
        }

        // PUT: api/DonationAllocations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDonationAllocation(int id, DonationAllocation donationAllocation)
        {
            if (id != donationAllocation.AllocationId)
            {
                return BadRequest();
            }

            _context.Entry(donationAllocation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DonationAllocationExists(id))
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

        // POST: api/DonationAllocations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DonationAllocation>> PostDonationAllocation(DonationAllocation donationAllocation)
        {
            _context.DonationAllocations.Add(donationAllocation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDonationAllocation", new { id = donationAllocation.AllocationId }, donationAllocation);
        }

        // DELETE: api/DonationAllocations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonationAllocation(int id)
        {
            var donationAllocation = await _context.DonationAllocations.FindAsync(id);
            if (donationAllocation == null)
            {
                return NotFound();
            }

            _context.DonationAllocations.Remove(donationAllocation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DonationAllocationExists(int id)
        {
            return _context.DonationAllocations.Any(e => e.AllocationId == id);
        }
    }
}
