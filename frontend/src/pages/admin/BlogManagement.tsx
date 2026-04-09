import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import apiClient from '../../api/apiClient';

type BlogPost = {
  blogPostId: number;
  title: string;
  data: string;
  categories: string;
  comments: string;
  text: string;
};

type BlogPostForm = {
  title: string;
  data: string;
  categories: string;
  comments: string;
  text: string;
};

const emptyForm: BlogPostForm = {
  title: '',
  data: '',
  categories: '',
  comments: '',
  text: '',
};

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<BlogPost[]>('/BlogPosts');
      setPosts(response.data);
    } catch {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const updateField = (key: keyof BlogPostForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createPost = async () => {
    if (!form.title.trim() || !form.data.trim() || !form.categories.trim() || !form.comments.trim() || !form.text.trim()) {
      setError('Please fill out all blog post fields.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiClient.post('/BlogPosts', {
        title: form.title.trim(),
        data: form.data.trim(),
        categories: form.categories.trim(),
        comments: form.comments.trim(),
        text: form.text.trim(),
      });
      setForm(emptyForm);
      await loadPosts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = (err.response?.data as { message?: string; errors?: string } | undefined)?.message;
        const backendErrors = (err.response?.data as { message?: string; errors?: string } | undefined)?.errors;
        setError(backendMessage ?? backendErrors ?? 'Failed to create blog post.');
      } else {
        setError('Failed to create blog post.');
      }
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (blogPostId: number) => {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/BlogPosts/${blogPostId}`);
      await loadPosts();
    } catch {
      setError('Failed to delete blog post.');
    }
  };

  return (
    <AdminLayout title="Blog Management">
      <div className="page-header">
        <div>
          <h2>Blog Management</h2>
          <p>Create and manage public-facing blog posts.</p>
        </div>
      </div>

      <div className="admin-card">
        <h3>Create New Post</h3>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data</label>
          <input
            type="text"
            value={form.data}
            onChange={(e) => updateField('data', e.target.value)}
            placeholder="May 11, 2025"
          />
        </div>
        <div className="form-group">
          <label>Categories</label>
          <input type="text" value={form.categories} onChange={(e) => updateField('categories', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Comments</label>
          <input type="text" value={form.comments} onChange={(e) => updateField('comments', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Text</label>
          <textarea
            rows={14}
            value={form.text}
            onChange={(e) => updateField('text', e.target.value)}
            style={{
              fontFamily: 'var(--sans)',
              padding: '0.7rem 0.9rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {error && <p style={{ color: '#c62828', marginBottom: '0.75rem' }}>{error}</p>}
        <button className="btn btn-primary" onClick={createPost} disabled={saving}>
          {saving ? 'Saving...' : 'Create Post'}
        </button>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Existing Posts</h3>
          <small className="refresh-chip">{posts.length} total</small>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Categories</th>
              <th>Comments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="placeholder-row">Loading blog posts...</td>
              </tr>
            )}
            {!loading && !error && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="placeholder-row">No posts found.</td>
              </tr>
            )}
            {!loading && posts.map((post) => (
              <tr key={post.blogPostId}>
                <td>{post.title}</td>
                <td>{post.date}</td>
                <td>{post.categories}</td>
                <td>{post.comments}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deletePost(post.blogPostId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
