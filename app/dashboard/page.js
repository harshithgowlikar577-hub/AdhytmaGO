'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useCeremony } from '../context/CeremonyContext';
import './page.css';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { ceremonyPlan, toggleDrawer } = useCeremony();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '16px' }}>☸️</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || user.displayName || user.email?.split('@')[0] || 'Devotee';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header-card animate-fade-in-up">
          <div className="dashboard-user-info">
            <div className="dashboard-avatar">{initial}</div>
            <div>
              <h1 className="dashboard-name">Namaste, {displayName} 🙏</h1>
              <p className="dashboard-meta">{user.email} • {profile?.address || 'Hyderabad, Telangana'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link href="/ceremony-services" className="btn btn-primary btn-sm">
              Plan New Ceremony
            </Link>
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm" id="dashboard-signout-btn">
              Sign Out
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Main Column */}
          <div>
            {/* Active Ceremony Plan */}
            <div className="dashboard-card animate-fade-in-up delay-1">
              <div className="dashboard-card-title">
                <span>Active Ceremony Plan</span>
                <span className="badge badge-verified">{ceremonyPlan.length} Selected</span>
              </div>
              {ceremonyPlan.length > 0 ? (
                <div>
                  <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    You have {ceremonyPlan.length} items in your current ceremony plan.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Link href="/ceremony-plan" className="btn btn-primary btn-sm">
                      Review & Book Plan →
                    </Link>
                    <button onClick={toggleDrawer} className="btn btn-secondary btn-sm">
                      Open Plan Drawer
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                  <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }}>
                    You haven't added any services to your plan yet.
                  </p>
                  <Link href="/ceremony-services" className="btn btn-primary btn-sm">
                    Discover Services Near You
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card animate-fade-in-up delay-2">
              <div className="dashboard-card-title">Explore Sacred Services</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <Link href="/ceremony-services?category=priests" className="quick-action-card">
                  <span className="quick-action-icon">🧑</span>
                  <div>
                    <strong>Find Pandits</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Vedic priests for all rituals</div>
                  </div>
                </Link>
                <Link href="/ceremony-services?category=venues" className="quick-action-card">
                  <span className="quick-action-icon">🏛️</span>
                  <div>
                    <strong>Function Halls</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Halls with required capacity</div>
                  </div>
                </Link>
                <Link href="/ceremony-services?category=temples" className="quick-action-card">
                  <span className="quick-action-icon">🛕</span>
                  <div>
                    <strong>Nearby Temples</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Poojas, sevas and darshans</div>
                  </div>
                </Link>
                <Link href="/ai" className="quick-action-card">
                  <span className="quick-action-icon">✨</span>
                  <div>
                    <strong>AI Ceremony Planner</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Guided ritual assistance</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div>
            <div className="dashboard-card animate-fade-in-up delay-1">
              <div className="dashboard-card-title">
                <span>Profile Details</span>
                <Link href="/onboarding" className="btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
                  Edit
                </Link>
              </div>
              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{profile?.full_name || 'Not set'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{profile?.age || 'Not set'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{profile?.phone || 'Not set'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">City / Area</span>
                  <span className="detail-value">{profile?.address || 'Hyderabad'}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card animate-fade-in-up delay-2" style={{ background: 'var(--color-cream)', borderColor: 'var(--color-saffron-light)' }}>
              <div className="dashboard-card-title" style={{ color: 'var(--color-saffron-dark)' }}>
                🛡️ Trust & Safety Verified
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
                All service providers on AdhyatmaGO are verified Vedic practitioners and certified venues in Telangana & Andhra Pradesh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
