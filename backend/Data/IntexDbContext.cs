using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class IntexDbContext : IdentityDbContext<ApplicationUser>
{
    public IntexDbContext(DbContextOptions<IntexDbContext> options)
        : base(options)
    {
    }

    public DbSet<Safehouse> Safehouses { get; set; } = null!;
    public DbSet<Partner> Partners { get; set; } = null!;
    public DbSet<PartnerAssignment> PartnerAssignments { get; set; } = null!;
    public DbSet<Supporter> Supporters { get; set; } = null!;
    public DbSet<Donation> Donations { get; set; } = null!;
    public DbSet<InKindDonationItem> InKindDonationItems { get; set; } = null!;
    public DbSet<DonationAllocation> DonationAllocations { get; set; } = null!;
    public DbSet<Resident> Residents { get; set; } = null!;
    public DbSet<ProcessRecording> ProcessRecordings { get; set; } = null!;
    public DbSet<HomeVisitation> HomeVisitations { get; set; } = null!;
    public DbSet<EducationRecord> EducationRecords { get; set; } = null!;
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords { get; set; } = null!;
    public DbSet<InterventionPlan> InterventionPlans { get; set; } = null!;
    public DbSet<IncidentReport> IncidentReports { get; set; } = null!;
    public DbSet<SocialMediaPost> SocialMediaPosts { get; set; } = null!;
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics { get; set; } = null!;
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots { get; set; } = null!;
    public DbSet<DonorRetentionPrediction> DonorRetentionPredictions { get; set; } = null!;
    public DbSet<ResidentProgressPrediction> ResidentProgressPredictions { get; set; } = null!;
    public DbSet<IncidentRiskPrediction> IncidentRiskPredictions { get; set; } = null!;
    public DbSet<SocialDonationPrediction> SocialDonationPredictions { get; set; } = null!;
}
