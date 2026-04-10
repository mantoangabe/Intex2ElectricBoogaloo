import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import apiClient from '../api/apiClient';
import '../styles/styles.css';
import '../styles/BlogPage.css';

type BlogPost = {
  blogPostId: number;
  title: string;
  data: string;
  categories: string;
  comments: string;
  text: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<BlogPost[]>('/PublicBlog/posts')
      .then((response) => {
        setPosts(response.data);
        setError(null);
      })
      .catch(() => setError('Unable to load blog posts right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="blog-page-shell">
      <Navbar />
      <main className="blog-page-main">
        <section className="blog-hero">
          <p className="blog-kicker">Public Blog</p>
          <h1>Blog</h1>
          <p>Reflections, updates, and stories from River of Life.</p>
        </section>

        <div className="blog-layout">
          <div className="blog-list">
            {loading && (
              <article className="blog-card">
                <p className="blog-meta">Loading blog posts...</p>
              </article>
            )}
            {!loading && error && (
              <article className="blog-card">
                <p className="blog-meta">{error}</p>
              </article>
            )}
            {!loading && !error && posts.length === 0 && (
              <article className="blog-card">
                <p className="blog-meta">No blog posts have been published yet.</p>
              </article>
            )}
            {!loading && !error && posts.map((post) => (
              <article key={post.blogPostId} className="blog-card">
                <h2>{post.title}</h2>
                <p className="blog-meta">{post.data}</p>
                <p className="blog-tagline">
                  <strong>Categories:</strong> {post.categories} | <strong>Comments:</strong> {post.comments}
                </p>
                <div className="blog-body">
                  {post.text.split(/\r?\n\s*\r?\n/).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="blog-sidebar">
            <article className="blog-sidebar-card">
              <h2>Community Moments</h2>
              <p>
                A small gallery from the stories, work, and hope surrounding River of Life.
              </p>
              <div className="blog-photo-grid">
                <img src="/Blog1.png" alt="Blog highlight one" />
                <img src="/Blog2.jpg" alt="Blog highlight two" />
                <img src="/Blog3.jpeg" alt="Blog highlight three" />
                <img src="/Blog4.jpg" alt="Blog highlight four" />
              </div>
            </article>
          </aside>
        </div>
      </main>
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
