using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("resident_progress_predictions")]
public class ResidentProgressPrediction
{
    [Key]
    [Column("prediction_id")]
    public int PredictionId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("as_of_date")]
    public DateTime AsOfDate { get; set; }

    [Column("low_progress_risk_probability")]
    public double LowProgressRiskProbability { get; set; }

    [Column("priority_band")]
    public string? PriorityBand { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = string.Empty;

    [Column("scored_at")]
    public DateTime ScoredAt { get; set; }
}
