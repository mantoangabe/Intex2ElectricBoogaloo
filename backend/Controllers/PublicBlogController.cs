using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicBlogController : ControllerBase
{
    private readonly IntexDbContext _context;

    public PublicBlogController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet("posts")]
    public async Task<ActionResult<IEnumerable<BlogPost>>> GetPublicPosts()
    {
        return await _context.BlogPosts
            .AsNoTracking()
            .OrderByDescending(post => post.BlogPostId)
            .ToListAsync();
    }

    [HttpGet("posts/{id}")]
    public async Task<ActionResult<BlogPost>> GetPublicPost(int id)
    {
        var blogPost = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(post => post.BlogPostId == id);

        if (blogPost == null)
        {
            return NotFound();
        }

        return blogPost;
    }
}
