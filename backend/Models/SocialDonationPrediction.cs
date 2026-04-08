using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("social_donation_predictions")]
public class SocialDonationPrediction
{
    [Key]
    [Column("prediction_id")]
    public int PredictionId { get; set; }

    [Column("post_id")]
    public int PostId { get; set; }

    [Column("as_of_date")]
    public DateTime AsOfDate { get; set; }

    [Column("predicted_donation_value_php")]
    public double PredictedDonationValuePhp { get; set; }

    [Column("p_high_conversion")]
    public double? PHighConversion { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = string.Empty;

    [Column("scored_at")]
    public DateTime ScoredAt { get; set; }
}
