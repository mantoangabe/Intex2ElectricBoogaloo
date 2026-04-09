import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const prompt = (location.state as { prompt?: string } | null)?.prompt;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(email.trim(), password);

      if (user.roleId === 2) {
        navigate('/admin/dashboard');
      } else {
        navigate('/donor/dashboard');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError('Login failed. Invalid email or password.');
        } else {
          setError(`Login request failed (${status ?? 'network error'}).`);
        }
      } else {
        setError('Login failed. Check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>River of Life Admin</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {prompt && <p style={{ color: '#1a4f9c', marginBottom: '0.75rem' }}>{prompt}</p>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <p style={{ color: '#c62828', marginBottom: '0.75rem' }}>{error}</p>}

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Use your account credentials to continue.</p>
          <p>
            Don't have an account? <Link className="auth-inline-link" to="/signup">Create one here!</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
