using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("donor_retention_predictions")]
public class DonorRetentionPrediction
{
    [Key]
    [Column("prediction_id")]
    public int PredictionId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("as_of_date")]
    public DateTime AsOfDate { get; set; }

    [Column("lapse_risk_probability")]
    public double LapseRiskProbability { get; set; }

    [Column("risk_band")]
    public string? RiskBand { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = string.Empty;

    [Column("scored_at")]
    public DateTime ScoredAt { get; set; }
}
