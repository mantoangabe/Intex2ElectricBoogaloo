using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("safehouses")]
public class Safehouse
{
    [Key]
    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("safehouse_code")]
    public string SafehouseCode { get; set; } = string.Empty;

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("region")]
    public string Region { get; set; } = string.Empty;

    [Column("city")]
    public string City { get; set; } = string.Empty;

    [Column("province")]
    public string Province { get; set; } = string.Empty;

    [Column("country")]
    public string Country { get; set; } = string.Empty;

    [Column("open_date")]
    public DateTime OpenDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("capacity_girls")]
    public int CapacityGirls { get; set; }

    [Column("capacity_staff")]
    public int CapacityStaff { get; set; }

    [Column("current_occupancy")]
    public int CurrentOccupancy { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }
}
