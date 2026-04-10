using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("supporters")]
public class Supporter
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("supporter_type")]
    public string SupporterType { get; set; } = string.Empty;

    [Column("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [Column("organization_name")]
    public string? OrganizationName { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("relationship_type")]
    public string RelationshipType { get; set; } = string.Empty;

    [Column("region")]
    public string Region { get; set; } = string.Empty;

    [Column("country")]
    public string Country { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("phone")]
    public string Phone { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("first_donation_date")]
    public DateTime? FirstDonationDate { get; set; }

    [Column("acquisition_channel")]
    public string AcquisitionChannel { get; set; } = string.Empty;

    [Column("lapse_risk_probability")]
    public double? LapseRiskProbability { get; set; }

    [Column("lapse_reached_out")]
    public bool LapseReachedOut { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
