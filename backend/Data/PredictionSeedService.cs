using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class PredictionSeedService
{
    public static async Task SeedAsync(IntexDbContext context)
    {
        var scoredAt = DateTime.UtcNow.Date.AddDays(-1).AddHours(2);
        var asOfDate = scoredAt.Date;

        if (!await context.DonorRetentionPredictions.AnyAsync())
            await SeedDonorRetentionAsync(context, asOfDate, scoredAt);

        if (!await context.ResidentProgressPredictions.AnyAsync())
            await SeedResidentProgressAsync(context, asOfDate, scoredAt);

        if (!await context.IncidentRiskPredictions.AnyAsync())
            await SeedIncidentRiskAsync(context, asOfDate, scoredAt);

        if (!await context.SocialDonationPredictions.AnyAsync())
            await SeedSocialDonationAsync(context, asOfDate, scoredAt);
    }

    private static async Task SeedDonorRetentionAsync(IntexDbContext context, DateTime asOfDate, DateTime scoredAt)
    {
        var supporters = await context.Supporters
            .Select(s => new { s.SupporterId, s.Status })
            .ToListAsync();

        var rows = supporters.Select(s =>
        {
            var prob = Clamp(0.05 + Hash01(s.SupporterId) * 0.85 + (s.Status == "Inactive" ? 0.08 : 0));
            return new DonorRetentionPrediction
            {
                SupporterId = s.SupporterId,
                AsOfDate = asOfDate,
                LapseRiskProbability = prob,
                RiskBand = Band(prob),
                ModelVersion = "donor_lapse_v2",
                ScoredAt = scoredAt
            };
        });

        context.DonorRetentionPredictions.AddRange(rows);
        await context.SaveChangesAsync();
    }

    private static async Task SeedResidentProgressAsync(IntexDbContext context, DateTime asOfDate, DateTime scoredAt)
    {
        var residents = await context.Residents
            .Select(r => new { r.ResidentId, r.CurrentRiskLevel, r.CaseStatus })
            .ToListAsync();

        var rows = residents.Select(r =>
        {
            var riskAdj = r.CurrentRiskLevel switch
            {
                "High" => 0.20,
                "Medium" => 0.10,
                _ => 0.03
            };
            var statusAdj = r.CaseStatus == "Active" ? 0.06 : 0.0;
            var prob = Clamp(0.04 + Hash01(r.ResidentId * 7) * 0.75 + riskAdj + statusAdj);
            return new ResidentProgressPrediction
            {
                ResidentId = r.ResidentId,
                AsOfDate = asOfDate,
                LowProgressRiskProbability = prob,
                PriorityBand = Band(prob),
                ModelVersion = "resident_progress_v2",
                ScoredAt = scoredAt
            };
        });

        context.ResidentProgressPredictions.AddRange(rows);
        await context.SaveChangesAsync();
    }

    private static async Task SeedIncidentRiskAsync(IntexDbContext context, DateTime asOfDate, DateTime scoredAt)
    {
        var incidentCounts = await context.IncidentReports
            .GroupBy(i => i.ResidentId)
            .Select(g => new { ResidentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ResidentId, x => x.Count);

        var residents = await context.Residents
            .Select(r => new { r.ResidentId, r.CurrentRiskLevel })
            .ToListAsync();

        var rows = residents.Select(r =>
        {
            incidentCounts.TryGetValue(r.ResidentId, out var cnt);
            var historyAdj = Math.Min(0.25, cnt * 0.02);
            var riskAdj = r.CurrentRiskLevel switch
            {
                "High" => 0.15,
                "Medium" => 0.07,
                _ => 0.02
            };
            var prob = Clamp(0.03 + Hash01(r.ResidentId * 11) * 0.70 + historyAdj + riskAdj);
            return new IncidentRiskPrediction
            {
                ResidentId = r.ResidentId,
                AsOfDate = asOfDate,
                IncidentRiskProbability = prob,
                RiskBand = Band(prob),
                ModelVersion = "incident_risk_v3",
                ScoredAt = scoredAt
            };
        });

        context.IncidentRiskPredictions.AddRange(rows);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSocialDonationAsync(IntexDbContext context, DateTime asOfDate, DateTime scoredAt)
    {
        var posts = await context.SocialMediaPosts
            .Select(p => new
            {
                p.PostId,
                p.Platform,
                p.PostType,
                p.HasCallToAction,
                p.BoostBudgetPhp,
                p.FeaturesResidentStory
            })
            .ToListAsync();

        var rows = posts.Select(p =>
        {
            var platformMult = p.Platform switch
            {
                "Instagram" => 1.25,
                "Facebook" => 1.20,
                "WhatsApp" => 1.15,
                _ => 1.0
            };
            var typeMult = p.PostType == "FundraisingAppeal" ? 1.35 : 1.0;
            var ctaMult = p.HasCallToAction ? 1.1 : 0.95;
            var storyMult = p.FeaturesResidentStory ? 1.08 : 1.0;
            var boost = (double)(p.BoostBudgetPhp ?? 0m);
            var baseVal = (Hash01(p.PostId * 17) * 18000.0 + 1500.0) * platformMult * typeMult * ctaMult * storyMult;
            var predictedValue = Math.Round(baseVal + boost * 0.9, 2);
            var pHigh = Clamp(0.08 + predictedValue / 65000.0);
            return new SocialDonationPrediction
            {
                PostId = p.PostId,
                AsOfDate = asOfDate,
                PredictedDonationValuePhp = predictedValue,
                PHighConversion = pHigh,
                ModelVersion = "social_donation_impact_v4",
                ScoredAt = scoredAt
            };
        });

        context.SocialDonationPredictions.AddRange(rows);
        await context.SaveChangesAsync();
    }

    private static double Hash01(int x)
    {
        unchecked
        {
            var h = (uint)(x * 2654435761);
            return (h % 1000) / 999.0;
        }
    }

    private static string Band(double p) => p switch
    {
        >= 0.66 => "High",
        >= 0.33 => "Medium",
        _ => "Low"
    };

    private static double Clamp(double v) => Math.Max(0.01, Math.Min(0.99, v));
}
