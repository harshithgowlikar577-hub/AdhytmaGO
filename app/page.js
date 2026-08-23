'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCeremony } from './context/CeremonyContext';
import LocationSelector from './components/LocationSelector';
import TrustStrip from './components/home/TrustStrip';
import ServiceCards from './components/home/ServiceCards';
import FeaturedCeremonies from './components/home/FeaturedCeremonies';
import VerifiedPriestsSection from './components/home/VerifiedPriestsSection';
import HowItWorks from './components/home/HowItWorks';
import ChecklistPreview from './components/home/ChecklistPreview';
import LanguageSection from './components/home/LanguageSection';
import TrustSafety from './components/home/TrustSafety';
import FinalCTA from './components/home/FinalCTA';
import './components/home/HomeComponents.css';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { setAiQuery } = useCeremony();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickAISubmit = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    setAiQuery(quickQuery);
    router.push(`/ai?q=${encodeURIComponent(quickQuery)}`);
  };

  const handleChipClick = (prompt) => {
    setQuickQuery(prompt);
    setAiQuery(prompt);
    router.push(`/ai?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className={styles.home}>
      {/* 1. Hero Section */}
      <section className={`${styles.hero} gradient-hero`} style={{ paddingBottom: 'var(--space-12)' }}>
        <div className="container">
          <div className={styles.heroContent} style={{ maxWidth: '850px' }}>
            <div className="home-hero-badge animate-fade-in-up">
              <span>✨</span>
              <span>AI-Assisted Ceremony Planning Platform</span>
            </div>

            <h1 className="animate-fade-in-up delay-1" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.15 }}>
              Plan Your Ceremony. Find Trusted Services. Everything in One Place.
            </h1>

            <p className="animate-fade-in-up delay-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', maxWidth: '680px', margin: '16px auto 0' }}>
              Discover verified Vedic pandits, temple poojas, and premium function halls in Hyderabad & Telangana with intelligent ritual guidance and checklists.
            </p>

            <div className="home-hero-ctas animate-fade-in-up delay-2">
              <Link href="/ai" className="btn btn-primary btn-lg" id="hero-plan-ai-btn">
                ✨ Plan with AI
              </Link>
              <Link href="/ceremony-services" className="btn btn-secondary btn-lg" id="hero-explore-btn">
                Explore Services Around You
              </Link>
            </div>

            {/* Quick AI Input Box */}
            <div className="hero-quick-ai animate-fade-in-up delay-3">
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '8px' }}>
                What ceremony are you planning?
              </h3>
              <form onSubmit={handleQuickAISubmit} className="quick-ai-input-row">
                <span style={{ fontSize: '18px' }}>🔍</span>
                <input
                  type="text"
                  className="quick-ai-input"
                  placeholder="e.g. I need a Telugu priest for Griha Pravesham next Sunday in Hyderabad..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 14px' }}>
                  Ask AI →
                </button>
              </form>

              <div className="quick-ai-chips">
                <span style={{ fontSize: '11px', color: 'var(--color-gray-400)', alignSelf: 'center' }}>Try asking:</span>
                {['Griha Pravesham in Hyderabad', 'Wedding Pandit in Secunderabad', 'Naming Ceremony (Namakaranam)', 'Temples near Gachibowli'].map((chip, idx) => (
                  <button key={idx} type="button" className="quick-chip" onClick={() => handleChipClick(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Location selector */}
            <div style={{ marginTop: 'var(--space-6)', width: '100%', maxWidth: '420px' }}>
              <LocationSelector compact={false} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Main Service Cards */}
      <ServiceCards />

      {/* 4. Ceremony Categories */}
      <FeaturedCeremonies />

      {/* 5. Verified Priests */}
      <VerifiedPriestsSection />

      {/* 6. How It Works */}
      <HowItWorks />

      {/* 7. Preparation Checklist Preview */}
      <ChecklistPreview />

      {/* 8. Multilingual Support (English + Telugu) */}
      <LanguageSection />

      {/* 9. Trust, Authenticity & Safety */}
      <TrustSafety />

      {/* 10. Final Call to Action */}
      <FinalCTA />

      {/* 11. Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', height: '40px' }}>
                <img src="/images/logo.jpg" alt="AdhyatmaGO" style={{ height: '36px', objectFit: 'contain' }} />
              </div>
              <p style={{ color: 'var(--color-gray-500)', fontSize: '14px' }}>
                Sacred Ceremony Planning & Verified Spiritual Services • Hyderabad, Telangana
              </p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/ceremony-services?category=priests">Priests</Link>
              <Link href="/ceremony-services?category=temples">Temples</Link>
              <Link href="/ceremony-services?category=venues">Function Halls</Link>
              <Link href="/ai">AI Assistant</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © {new Date().getFullYear()} AdhyatmaGO. All rights reserved. Built with reverence for sacred traditions.
          </div>
        </div>
      </footer>
    </div>
  );
}
