using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminMetricsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public AdminMetricsController(IntexDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("overview")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOverview()
    {
        var residentCount = await _context.Residents.CountAsync();
        var supporterCount = await _context.Supporters.CountAsync();
        var safehouseCount = await _context.Safehouses.CountAsync();
        var donationTotal = await _context.Donations
            .SumAsync(d => (decimal?)d.Amount ?? d.EstimatedValue ?? 0m);

        return Ok(new
        {
            residentCount,
            supporterCount,
            donationTotal,
            safehouseCount,
        });
    }
}
