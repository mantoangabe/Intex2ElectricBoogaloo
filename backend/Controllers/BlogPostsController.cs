using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class BlogPostsController : ControllerBase
{
    private readonly IntexDbContext _context;

    public BlogPostsController(IntexDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogPost>>> GetBlogPosts([FromQuery] int skip = 0, [FromQuery] int take = 100)
    {
        if (skip < 0) skip = 0;
        if (take <= 0) take = 100;

        return await _context.BlogPosts
            .AsNoTracking()
            .OrderByDescending(post => post.BlogPostId)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogPost>> GetBlogPost(int id)
    {
        var blogPost = await _context.BlogPosts.FindAsync(id);
        if (blogPost == null)
        {
            return NotFound();
        }

        return blogPost;
    }

    [HttpPost]
    public async Task<ActionResult<BlogPost>> PostBlogPost(BlogPost blogPost)
    {
        _context.BlogPosts.Add(blogPost);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBlogPost), new { id = blogPost.BlogPostId }, blogPost);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutBlogPost(int id, BlogPost blogPost)
    {
        if (id != blogPost.BlogPostId)
        {
            return BadRequest();
        }

        _context.Entry(blogPost).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.BlogPosts.AnyAsync(post => post.BlogPostId == id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBlogPost(int id)
    {
        var blogPost = await _context.BlogPosts.FindAsync(id);
        if (blogPost == null)
        {
            return NotFound();
        }

        _context.BlogPosts.Remove(blogPost);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
