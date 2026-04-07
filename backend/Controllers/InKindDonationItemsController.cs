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
    public class InKindDonationItemsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public InKindDonationItemsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/InKindDonationItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InKindDonationItem>>> GetInKindDonationItems()
        {
            return await _context.InKindDonationItems.ToListAsync();
        }

        // GET: api/InKindDonationItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InKindDonationItem>> GetInKindDonationItem(int id)
        {
            var inKindDonationItem = await _context.InKindDonationItems.FindAsync(id);

            if (inKindDonationItem == null)
            {
                return NotFound();
            }

            return inKindDonationItem;
        }

        // PUT: api/InKindDonationItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInKindDonationItem(int id, InKindDonationItem inKindDonationItem)
        {
            if (id != inKindDonationItem.ItemId)
            {
                return BadRequest();
            }

            _context.Entry(inKindDonationItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InKindDonationItemExists(id))
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

        // POST: api/InKindDonationItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<InKindDonationItem>> PostInKindDonationItem(InKindDonationItem inKindDonationItem)
        {
            _context.InKindDonationItems.Add(inKindDonationItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInKindDonationItem", new { id = inKindDonationItem.ItemId }, inKindDonationItem);
        }

        // DELETE: api/InKindDonationItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInKindDonationItem(int id)
        {
            var inKindDonationItem = await _context.InKindDonationItems.FindAsync(id);
            if (inKindDonationItem == null)
            {
                return NotFound();
            }

            _context.InKindDonationItems.Remove(inKindDonationItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InKindDonationItemExists(int id)
        {
            return _context.InKindDonationItems.Any(e => e.ItemId == id);
        }
    }
}
