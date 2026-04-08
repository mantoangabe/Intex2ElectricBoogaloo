using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
