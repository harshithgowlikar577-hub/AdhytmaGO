'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import './page.css';

export default function OnboardingPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && profile?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (user) {
      const googleName = user.displayName || '';
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || googleName,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required.';
    const age = parseInt(formData.age, 10);
    if (!formData.age) newErrors.age = 'Age is required.';
    else if (isNaN(age) || age < 1 || age > 120) newErrors.age = 'Please enter a valid age.';
    const phone = formData.phone.replace(/\s/g, '');
    if (!phone) newErrors.phone = 'Phone number is required.';
    else if (!/^\+?\d{7,15}$/.test(phone)) newErrors.phone = 'Please enter a valid phone number.';
    if (!formData.address.trim()) newErrors.address = 'Address / Location is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const uid = user.uid || user.id;
      const profileData = {
        id: uid,
        email: user?.email || '',
        full_name: formData.full_name.trim(),
        age: parseInt(formData.age, 10),
        phone: formData.phone.replace(/\s/g, ''),
        address: formData.address.trim(),
        onboarding_completed: true,
        role: profile?.role || 'user',
        updated_at: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'profiles', uid), profileData, { merge: true });
      } catch (err) {
        console.warn('Firestore write fallback:', err.message);
        // Fallback local storage profile for offline/sandbox testing
        localStorage.setItem(`profile_${uid}`, JSON.stringify(profileData));
      }

      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      console.error('Profile save error:', err);
      setSubmitError('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="onboarding-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '16px' }}>☸️</div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (success) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container animate-fade-in-up">
          <div className="onboarding-card onboarding-success">
            <div className="success-icon">✨</div>
            <h2 className="onboarding-heading">Your profile is ready!</h2>
            <p className="onboarding-subheading" style={{ marginBottom: '24px' }}>
              Welcome to AdhyatmaGO, <strong>{formData.full_name}</strong>.
            </p>
            <button
              className="auth-submit-btn"
              onClick={() => router.push('/dashboard')}
              id="start-planning-btn"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container animate-fade-in-up">
        <header className="onboarding-header">
          <h1 className="onboarding-heading">Complete Your Profile</h1>
          <p className="onboarding-subheading">
            Tell us a little about yourself so we can personalize your ceremony planning experience.
          </p>
        </header>

        <div className="onboarding-card">
          {submitError && (
            <div className="login-error" role="alert">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                readOnly
              />
              <p className="form-note">From your account — cannot be changed here.</p>
            </div>

            <div className="form-group">
              <label htmlFor="full_name">
                Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className={errors.full_name ? 'form-input-error' : ''}
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              {errors.full_name && <p className="form-error">{errors.full_name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="age">
                Age <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                className={errors.age ? 'form-input-error' : ''}
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
              {errors.age && <p className="form-error">{errors.age}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Contact Phone <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={errors.phone ? 'form-input-error' : ''}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Address / City <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className={errors.address ? 'form-input-error' : ''}
                placeholder="e.g. Gachibowli, Hyderabad"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="form-error">{errors.address}</p>}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
              id="onboarding-submit-btn"
              style={{ marginTop: '16px' }}
            >
              {submitting ? 'Saving Profile...' : 'Complete Profile & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
