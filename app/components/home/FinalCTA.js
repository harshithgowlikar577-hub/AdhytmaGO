'use client';

import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="container">
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Ready to Plan Your Sacred Ceremony?
        </h2>
        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
          Discover verified pandits, check availability for nearby temples and kalyana mandapams, and get tailored AI guidance.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/ai" className="btn btn-primary btn-lg" id="cta-ai-btn">
            ✨ Plan with AI Assistant
          </Link>
          <Link href="/ceremony-services" className="btn btn-secondary btn-lg" id="cta-explore-btn">
            Explore Services Around You
          </Link>
        </div>
      </div>
    </section>
  );
}
