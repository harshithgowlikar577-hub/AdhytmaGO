'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import './page.css';

export default function LoginPage() {
  const { user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      if (profile?.onboarding_completed) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, profile, loading, router]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err) {
      console.error('Email Auth Error:', err);
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container animate-fade-in-up">
          <div className="login-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <img src="/images/logo.jpg" alt="AdhyatmaGO" style={{ height: '56px', objectFit: 'contain' }} />
          </div>

        <div className="login-card">
          <div className="card-top-accent"></div>

          <h2>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="login-card-sub">
            {mode === 'signup'
              ? 'Join AdhyatmaGO to plan ceremonies with verified pandits & venues'
              : 'Sign in to access your saved ceremony plans and bookings'}
          </p>

          {error && (
            <div className="login-error" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input
                type="email"
                id="auth-email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
              id="login-submit-btn"
            >
              {submitting
                ? 'Processing...'
                : mode === 'signup'
                ? 'Create Free Account'
                : 'Sign In'}
            </button>
          </form>

          <div className="auth-mode-toggle">
            {mode === 'signin' ? (
              <p>
                Don't have an account?
                <button
                  type="button"
                  className="mode-toggle-btn"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?
                <button
                  type="button"
                  className="mode-toggle-btn"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            id="google-signin-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <p className="login-footer-text">
            By signing in, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
