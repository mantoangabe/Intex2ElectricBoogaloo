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
    public class ResidentsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public ResidentsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/Residents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resident>>> GetResidents(
            [FromQuery] int skip = 0,
            [FromQuery] int take = 25,
            [FromQuery] string? search = null,
            [FromQuery] int? safehouseId = null,
            [FromQuery] string? caseCategory = null,
            [FromQuery] string? caseStatus = null)
        {
            if (skip < 0) skip = 0;
            if (take <= 0) take = 25;

            var query = ApplyFilters(_context.Residents.AsNoTracking(), search, safehouseId, caseCategory, caseStatus)
                .OrderBy(r => r.ResidentId);

            return await query.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/Residents/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetResidentsCount(
            [FromQuery] string? search = null,
            [FromQuery] int? safehouseId = null,
            [FromQuery] string? caseCategory = null,
            [FromQuery] string? caseStatus = null)
        {
            var query = ApplyFilters(_context.Residents.AsNoTracking(), search, safehouseId, caseCategory, caseStatus);
            return await query.CountAsync();
        }

        // GET: api/Residents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Resident>> GetResident(int id)
        {
            var resident = await _context.Residents.FindAsync(id);

            if (resident == null)
            {
                return NotFound();
            }

            return resident;
        }

        // PUT: api/Residents/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResident(int id, Resident resident)
        {
            if (id != resident.ResidentId)
            {
                return BadRequest();
            }

            _context.Entry(resident).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ResidentExists(id))
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

        // POST: api/Residents
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Resident>> PostResident(Resident resident)
        {
            _context.Residents.Add(resident);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetResident", new { id = resident.ResidentId }, resident);
        }

        // PATCH: api/Residents/5/reach-out
        [HttpPatch("{id}/reach-out")]
        public async Task<IActionResult> PatchResidentReachOut(int id, [FromBody] ResidentReachOutUpdateDto update)
        {
            var resident = await _context.Residents.FindAsync(id);
            if (resident == null)
            {
                return NotFound();
            }

            if (update.LowProgressReachedOut.HasValue)
            {
                resident.LowProgressReachedOut = update.LowProgressReachedOut.Value;
            }

            if (update.IncidentRiskReachedOut.HasValue)
            {
                resident.IncidentRiskReachedOut = update.IncidentRiskReachedOut.Value;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Residents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResident(int id)
        {
            var resident = await _context.Residents.FindAsync(id);
            if (resident == null)
            {
                return NotFound();
            }

            _context.Residents.Remove(resident);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResidentExists(int id)
        {
            return _context.Residents.Any(e => e.ResidentId == id);
        }

        private static IQueryable<Resident> ApplyFilters(
            IQueryable<Resident> query,
            string? search,
            int? safehouseId,
            string? caseCategory,
            string? caseStatus)
        {
            if (safehouseId.HasValue)
            {
                query = query.Where(r => r.SafehouseId == safehouseId.Value);
            }

            if (!string.IsNullOrWhiteSpace(caseCategory))
            {
                var category = caseCategory.Trim();
                query = query.Where(r => r.CaseCategory == category);
            }

            if (!string.IsNullOrWhiteSpace(caseStatus))
            {
                var status = caseStatus.Trim();
                query = query.Where(r => r.CaseStatus == status);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                var likeTerm = $"%{term}%";

                if (int.TryParse(term, out var residentId))
                {
                    query = query.Where(r =>
                        r.ResidentId == residentId ||
                        EF.Functions.ILike(r.CaseControlNo, likeTerm) ||
                        EF.Functions.ILike(r.InternalCode, likeTerm) ||
                        EF.Functions.ILike(r.AssignedSocialWorker, likeTerm));
                }
                else
                {
                    query = query.Where(r =>
                        EF.Functions.ILike(r.CaseControlNo, likeTerm) ||
                        EF.Functions.ILike(r.InternalCode, likeTerm) ||
                        EF.Functions.ILike(r.AssignedSocialWorker, likeTerm));
                }
            }

            return query;
        }

        public class ResidentReachOutUpdateDto
        {
            public bool? LowProgressReachedOut { get; set; }
            public bool? IncidentRiskReachedOut { get; set; }
        }
    }
}


