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
    public class DonationsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public DonationsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/Donations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Donation>>> GetDonations([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.Donations.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/Donations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Donation>> GetDonation(int id)
        {
            var donation = await _context.Donations.FindAsync(id);

            if (donation == null)
            {
                return NotFound();
            }

            return donation;
        }

        // PUT: api/Donations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDonation(int id, Donation donation)
        {
            if (id != donation.DonationId)
            {
                return BadRequest();
            }

            _context.Entry(donation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DonationExists(id))
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

        // POST: api/Donations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Donation>> PostDonation(Donation donation)
        {
            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDonation", new { id = donation.DonationId }, donation);
        }

        // DELETE: api/Donations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonation(int id)
        {
            var donation = await _context.Donations.FindAsync(id);
            if (donation == null)
            {
                return NotFound();
            }

            _context.Donations.Remove(donation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DonationExists(int id)
        {
            return _context.Donations.Any(e => e.DonationId == id);
        }
    }
}


