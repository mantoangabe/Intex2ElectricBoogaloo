using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SocialMediaPostsController : ControllerBase
    {
        private readonly IntexDbContext _context;

        public SocialMediaPostsController(IntexDbContext context)
        {
            _context = context;
        }

        // GET: api/SocialMediaPosts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SocialMediaPost>>> GetSocialMediaPosts([FromQuery] int skip = 0, [FromQuery] int take = 25)
        {
            return await _context.SocialMediaPosts.Skip(skip).Take(take).ToListAsync();
        }

        // GET: api/SocialMediaPosts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SocialMediaPost>> GetSocialMediaPost(int id)
        {
            var socialMediaPost = await _context.SocialMediaPosts.FindAsync(id);

            if (socialMediaPost == null)
            {
                return NotFound();
            }

            return socialMediaPost;
        }

        // PUT: api/SocialMediaPosts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSocialMediaPost(int id, SocialMediaPost socialMediaPost)
        {
            if (id != socialMediaPost.PostId)
            {
                return BadRequest();
            }

            _context.Entry(socialMediaPost).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SocialMediaPostExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SocialMediaPosts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SocialMediaPost>> PostSocialMediaPost(SocialMediaPost socialMediaPost)
        {
            _context.SocialMediaPosts.Add(socialMediaPost);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSocialMediaPost", new { id = socialMediaPost.PostId }, socialMediaPost);
        }

        // DELETE: api/SocialMediaPosts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSocialMediaPost(int id)
        {
            var socialMediaPost = await _context.SocialMediaPosts.FindAsync(id);
            if (socialMediaPost == null)
            {
                return NotFound();
            }

            _context.SocialMediaPosts.Remove(socialMediaPost);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SocialMediaPostExists(int id)
        {
            return _context.SocialMediaPosts.Any(e => e.PostId == id);
        }
    }
}


