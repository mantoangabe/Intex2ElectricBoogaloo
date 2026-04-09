using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DonationsController : ControllerBase
    {
        private readonly IntexDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DonationsController(IntexDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Donations
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Donation>>> GetDonations([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.Donations.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/Donations/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Donation>> PostDonation(Donation donation)
        {
            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDonation", new { id = donation.DonationId }, donation);
        }

        // DELETE: api/Donations/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
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

        // GET: api/Donations/mine
        [HttpGet("mine")]
        [Authorize(Roles = "Donor")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyDonations()
        {
            var user = await _userManager.GetUserAsync(User);
            var email = user?.Email;

            if (string.IsNullOrWhiteSpace(email))
            {
                return Unauthorized();
            }

            var donations = await (
                from donation in _context.Donations.AsNoTracking()
                join supporter in _context.Supporters.AsNoTracking() on donation.SupporterId equals supporter.SupporterId
                where supporter.Email == email
                orderby donation.DonationDate descending
                select new
                {
                    donationId = donation.DonationId,
                    date = donation.DonationDate,
                    amount = donation.Amount,
                    type = donation.DonationType,
                    programArea = donation.CampaignName,
                    note = donation.Notes
                }
            ).ToListAsync();

            return Ok(donations);
        }

        // POST: api/Donations/mine
        [HttpPost("mine")]
        [Authorize(Roles = "Donor")]
        public async Task<ActionResult<object>> CreateMyDonation([FromBody] CreateMyDonationDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            var email = user?.Email;

            if (string.IsNullOrWhiteSpace(email))
            {
                return Unauthorized();
            }

            if (dto.Amount <= 0)
            {
                return BadRequest(new { message = "Amount must be greater than zero." });
            }

            var supporter = await _context.Supporters
                .FirstOrDefaultAsync(s => s.Email == email);

            if (supporter == null)
            {
                var displayName = string.IsNullOrWhiteSpace(user?.UserName) ? email : user!.UserName!;
                supporter = new Supporter
                {
                    SupporterType = "Individual",
                    DisplayName = displayName,
                    FirstName = "Donor",
                    LastName = "User",
                    RelationshipType = "Donor",
                    Region = "Unknown",
                    Country = "Unknown",
                    Email = email,
                    Phone = "N/A",
                    Status = "Active",
                    AcquisitionChannel = "Website",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Supporters.Add(supporter);
                await _context.SaveChangesAsync();
            }

            var donation = new Donation
            {
                SupporterId = supporter.SupporterId,
                DonationType = string.IsNullOrWhiteSpace(dto.DonationType) ? "Monetary" : dto.DonationType.Trim(),
                DonationDate = DateTime.UtcNow,
                IsRecurring = false,
                CampaignName = dto.ProgramArea?.Trim(),
                ChannelSource = "Website",
                CurrencyCode = "USD",
                Amount = dto.Amount,
                EstimatedValue = dto.Amount,
                ImpactUnit = "Donation",
                Notes = dto.Note?.Trim()
            };

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                donationId = donation.DonationId,
                date = donation.DonationDate,
                amount = donation.Amount,
                type = donation.DonationType,
                programArea = donation.CampaignName,
                note = donation.Notes
            });
        }

        private bool DonationExists(int id)
        {
            return _context.Donations.Any(e => e.DonationId == id);
        }
    }

    public class CreateMyDonationDto
    {
        public decimal Amount { get; set; }
        public string DonationType { get; set; } = "Monetary";
        public string? ProgramArea { get; set; }
        public string? Note { get; set; }
    }
}


