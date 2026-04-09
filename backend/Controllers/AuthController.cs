using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!Enum.IsDefined(dto.Role))
            return BadRequest(new { message = "Role must be 1 (Donor) or 2 (Admin)" });

        var roleName = MapRoleName(dto.Role);

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = "User creation failed", errors });
        }

        // Assign role to user
        var roleResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = "Role assignment failed", errors });
        }

        _logger.LogInformation($"User {user.Email} registered with role {roleName} ({(int)dto.Role})");

        return Ok(new
        {
            message = "User registered successfully",
            email = user.Email,
            roleId = (int)dto.Role,
            role = roleName
        });
    }

    private static string MapRoleName(UserRole role) => role switch
    {
        UserRole.Donor => "Donor",
        UserRole.Admin => "Admin",
        _ => throw new ArgumentOutOfRangeException(nameof(role), "Unsupported role value")
    };

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            _logger.LogWarning($"Login attempt failed for non-existent user: {dto.Email}");
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var signInName = user.UserName ?? user.Email;
        if (string.IsNullOrWhiteSpace(signInName))
        {
            _logger.LogWarning("User {UserId} has no valid sign-in name", user.Id);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var result = await _signInManager.PasswordSignInAsync(signInName, dto.Password, isPersistent: false, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            _logger.LogWarning($"Login failed for user: {dto.Email}");
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        _logger.LogInformation($"User {user.Email} logged in successfully");

        return Ok(new
        {
            message = "Login successful",
            user = new
            {
                id = user.Id,
                email = user.Email,
                roles = roles
            }
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation($"User {User.FindFirst(ClaimTypes.Email)?.Value} logged out");
        return Ok(new { message = "Logout successful" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            roles = roles
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = "Password change failed", errors });
        }

        _logger.LogInformation($"User {user.Email} changed password");
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpGet("admin/users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsersForAdmin(
        [FromQuery] string? search = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 25)
    {
        if (skip < 0) skip = 0;
        if (take <= 0) take = 25;

        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var likeTerm = $"%{term}%";
            query = query.Where(u => u.Email != null && EF.Functions.ILike(u.Email, likeTerm));
        }

        var users = await query
            .OrderBy(u => u.Email)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var result = new List<object>(users.Count);

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var roleId = roles.Contains("Admin") ? 2 : 1;
            var roleName = roleId == 2 ? "Admin" : "Donor";

            result.Add(new
            {
                id = user.Id,
                email = user.Email,
                roleId,
                role = roleName,
            });
        }

        return Ok(result);
    }

    [HttpGet("admin/users/count")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsersForAdminCount([FromQuery] string? search = null)
    {
        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var likeTerm = $"%{term}%";
            query = query.Where(u => u.Email != null && EF.Functions.ILike(u.Email, likeTerm));
        }

        return Ok(await query.CountAsync());
    }

    [HttpPut("admin/users/{id}/promote")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PromoteDonorToAdmin(string id)
    {
        return await SetUserRoleAsync(id, UserRole.Admin);
    }

    [HttpPut("admin/users/{id}/demote")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DemoteAdminToDonor(string id)
    {
        var currentUserId = _userManager.GetUserId(User);
        if (string.Equals(currentUserId, id, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "You cannot demote your own account." });
        }

        return await SetUserRoleAsync(id, UserRole.Donor);
    }

    private async Task<IActionResult> SetUserRoleAsync(string id, UserRole targetRole)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var targetRoleName = MapRoleName(targetRole);
        var currentRoleName = roles.Contains("Admin") ? "Admin" : "Donor";

        if (string.Equals(currentRoleName, targetRoleName, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = $"User is already a {targetRoleName.ToLowerInvariant()}" });
        }

        foreach (var role in roles)
        {
            var removeResult = await _userManager.RemoveFromRoleAsync(user, role);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                return BadRequest(new { message = $"Failed to remove {role} role", errors });
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, targetRoleName);
        if (!addResult.Succeeded)
        {
            var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Failed to add {targetRoleName} role", errors });
        }

        _logger.LogInformation("User {Email} changed role to {Role}", user.Email, targetRoleName);

        return Ok(new
        {
            message = $"User updated to {targetRoleName}",
            id = user.Id,
            email = user.Email,
            roleId = targetRole == UserRole.Admin ? 2 : 1,
            role = targetRoleName,
        });
    }
}

public class RegisterDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public UserRole Role { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}
