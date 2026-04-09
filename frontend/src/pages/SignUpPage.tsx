import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../api/apiClient';
import '../styles/LoginPage.css';

const PASSWORD_RULES_TEXT = 'Password must be at least 14 characters long.';

function passwordMeetsRequirements(password: string): boolean {
  return password.length >= 14;
}

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!passwordMeetsRequirements(password)) {
      setError(PASSWORD_RULES_TEXT);
      return;
    }

    try {
      setIsSubmitting(true);

      await apiClient.post('/Auth/register', {
        email: email.trim(),
        password,
        role: 1,
      });

      navigate('/login', {
        state: {
          prompt: 'Account created successfully. Please sign in.',
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string; errors?: string } | undefined;
        const backendDetails = data?.errors;
        const message = data?.message;

        if (backendDetails) {
          setError(`${message ?? 'Sign-up failed.'} ${backendDetails}`);
        } else if (status === 400) {
          setError(PASSWORD_RULES_TEXT);
        } else {
          setError(message ?? `Sign-up failed (${status ?? 'network error'}).`);
        }
      } else {
        setError('Sign-up failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Create your donor account to continue</p>
        </div>

        <form onSubmit={handleSignUp} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M12 5C6.5 5 2.1 8.3 1 12c1.1 3.7 5.5 7 11 7s9.9-3.3 11-7c-1.1-3.7-5.5-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>
            </div>
            <small style={{ color: '#5f6d7e', display: 'block', marginTop: '0.4rem' }}>
              Must be at least 14 characters long.
            </small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-field-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M12 5C6.5 5 2.1 8.3 1 12c1.1 3.7 5.5 7 11 7s9.9-3.3 11-7c-1.1-3.7-5.5-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#c62828', marginBottom: '0.75rem' }}>{error}</p>}

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account? <Link className="auth-inline-link" to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
