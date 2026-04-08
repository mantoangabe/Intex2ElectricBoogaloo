using backend.Data;
using backend.Middleware;
using backend.Models;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var applyMigrations = builder.Configuration.GetValue<bool>("StartupTasks:ApplyMigrations");
var seedPredictions = builder.Configuration.GetValue<bool>("StartupTasks:SeedPredictions");

// Add DbContext
builder.Services.AddDbContext<IntexDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add Identity services
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Lockout settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        
        // User settings
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<IntexDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 14;
    options.Password.RequiredUniqueChars = 1;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

    // Trust reverse proxy headers in server environments where proxy IP may vary.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            return;
        }

        // Safe local fallback for development if config is missing.
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database with roles
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var db = scope.ServiceProvider.GetRequiredService<IntexDbContext>();

        if (applyMigrations)
        {
            await db.Database.MigrateAsync();
            logger.LogInformation("Applied database migrations.");
        }

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var roles = new[] { "Admin", "Donor" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (seedPredictions)
        {
            await PredictionSeedService.SeedAsync(db);
            logger.LogInformation("Seeded prediction tables.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Startup data initialization failed; app will continue running.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AppCors");
app.UseForwardedHeaders();

app.UseHttpsRedirection();
app.UseSecurityHeaders();

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
