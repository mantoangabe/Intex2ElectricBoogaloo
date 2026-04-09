using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicImpactController : ControllerBase
{
    private readonly IntexDbContext _context;

    public PublicImpactController(IntexDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("okrs")]
    public async Task<IActionResult> GetPublicOkrs()
    {
        var currentYear = DateTime.UtcNow.Year;

        var totalThisYear = await _context.Donations
            .Where(d => d.DonationDate.Year == currentYear)
            .SumAsync(d => (decimal?)d.Amount ?? d.EstimatedValue ?? 0m);

        var totalDonors = await _context.Donations
            .Select(d => d.SupporterId)
            .Distinct()
            .CountAsync();

        var partners = await _context.Partners.CountAsync();
        var residents = await _context.Residents.CountAsync();
        var safehouses = await _context.Safehouses.CountAsync();
        var healthCheckIns = await _context.HealthWellbeingRecords.CountAsync();
        var educationEnrollments = await _context.EducationRecords.CountAsync();

        return Ok(new
        {
            totalThisYear,
            totalDonors,
            partners,
            residents,
            safehouses,
            healthCheckIns,
            educationEnrollments,
        });
    }
}
