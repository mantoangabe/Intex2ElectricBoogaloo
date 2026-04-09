namespace backend.Models;

/// <summary>
/// One row per safehouse for a calendar month: stored monthly metrics with
/// computed fallbacks from education / health records when aggregates are missing.
/// </summary>
public class SafehouseMonthSummaryDto
{
    public int SafehouseId { get; set; }
    public string SafehouseName { get; set; } = string.Empty;
    public string MonthStart { get; set; } = string.Empty;
    public string MonthEnd { get; set; } = string.Empty;
    public int? MetricId { get; set; }
    public int ActiveResidents { get; set; }
    public decimal? AvgEducationProgress { get; set; }
    public decimal? AvgHealthScore { get; set; }
}
