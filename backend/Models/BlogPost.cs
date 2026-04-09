using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("blog_posts")]
public class BlogPost
{
    [Key]
    [Column("blog_post_id")]
    public int BlogPostId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("data")]
    public string Data { get; set; } = string.Empty;

    [Required]
    [Column("categories")]
    public string Categories { get; set; } = string.Empty;

    [Required]
    [Column("comments")]
    public string Comments { get; set; } = string.Empty;

    [Required]
    [Column("text")]
    public string Text { get; set; } = string.Empty;
}
