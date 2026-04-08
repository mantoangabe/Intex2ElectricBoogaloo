using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("incident_risk_predictions")]
public class IncidentRiskPrediction
{
    [Key]
    [Column("prediction_id")]
    public int PredictionId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("as_of_date")]
    public DateTime AsOfDate { get; set; }

    [Column("incident_risk_probability")]
    public double IncidentRiskProbability { get; set; }

    [Column("risk_band")]
    public string? RiskBand { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = string.Empty;

    [Column("scored_at")]
    public DateTime ScoredAt { get; set; }
}
