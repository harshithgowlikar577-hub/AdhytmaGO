'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCeremony } from '../context/CeremonyContext';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export default function Header() {
  const { ceremonyPlan, toggleDrawer, language, setLanguage } = useCeremony();
  const { user, profile } = useAuth();
  const planCount = ceremonyPlan.length;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = language === 'Telugu' ? 'తెలుగు (TE)' : 'English (EN)';

  return (
    <header className="header glass" id="main-header">
      <div className="header-inner container">
        <Link href="/" className="header-logo" id="logo-link" style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
          <img src="/images/logo.jpg" alt="AdhyatmaGO" style={{ height: '44px', objectFit: 'contain' }} />
        </Link>

        <nav className="header-nav" id="main-nav">
          <Link href="/" className="nav-link" id="nav-home">Home</Link>
          <Link href="/ceremony-services" className="nav-link" id="nav-services">
            Services
          </Link>
          <Link href="/ai" className="nav-link" id="nav-ai">
            ✨ AI Assistant
          </Link>
          <button
            className="nav-link plan-link"
            onClick={toggleDrawer}
            id="nav-plan"
          >
            My Plan
            {planCount > 0 && (
              <span className="plan-badge">{planCount}</span>
            )}
          </button>
        </nav>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="btn-ghost btn-sm"
              style={{ padding: '6px 10px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
              id="lang-toggle-btn"
            >
              🌐 {language === 'Telugu' ? 'తెలుగు' : 'EN'} ▾
            </button>
            {langMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-gray-200)',
                  zIndex: 100,
                  minWidth: '130px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => { setLanguage('English'); setLangMenuOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    background: language !== 'Telugu' ? 'var(--color-cream)' : 'white',
                    fontWeight: language !== 'Telugu' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => { setLanguage('Telugu'); setLangMenuOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    background: language === 'Telugu' ? 'var(--color-cream)' : 'white',
                    fontWeight: language === 'Telugu' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            )}
          </div>

          {/* User Auth Link */}
          {user ? (
            <Link
              href="/dashboard"
              className="btn btn-secondary btn-sm"
              id="header-user-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>👤</span>
              <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary btn-sm"
              id="header-login-btn"
            >
              Sign In
            </Link>
          )}

          {/* My Plan Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={toggleDrawer}
            id="header-plan-btn"
          >
            <span>📋</span>
            My Plan
            {planCount > 0 && (
              <span className="plan-badge-sm">{planCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
