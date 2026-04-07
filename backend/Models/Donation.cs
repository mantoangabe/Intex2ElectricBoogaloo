using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("donations")]
public class Donation
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("donation_type")]
    public string DonationType { get; set; } = string.Empty;

    [Column("donation_date")]
    public DateTime DonationDate { get; set; }

    [Column("is_recurring")]
    public bool IsRecurring { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("channel_source")]
    public string ChannelSource { get; set; } = string.Empty;

    [Column("currency_code")]
    public string? CurrencyCode { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("estimated_value")]
    public decimal? EstimatedValue { get; set; }

    [Column("impact_unit")]
    public string ImpactUnit { get; set; } = string.Empty;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_by_partner_id")]
    public int? CreatedByPartnerId { get; set; }

    [Column("referral_post_id")]
    public int? ReferralPostId { get; set; }
}
