'use client';

import Link from 'next/link';
import { priests } from '../../data/mockData';

export default function VerifiedPriestsSection() {
  const topPriests = priests.slice(0, 3);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>Verified Pandits & Vedic Acharyas</h2>
          <p>Experienced priests verified for credentials, ritual specializations, and transparent dakshina.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {topPriests.map((p) => (
            <div key={p.id} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: p.avatarColor,
                    flexShrink: 0,
                    border: '2px solid var(--color-saffron-light)',
                  }}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>🧑</div>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>{p.name}</h3>
                    {p.verified && <span className="badge badge-verified" style={{ fontSize: '10px' }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                    {p.experience} yrs exp • {p.location}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-saffron-dark)', fontWeight: 600, marginTop: '2px' }}>
                    ★ {p.rating} ({p.reviewCount} reviews)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-4)' }}>
                {p.languages.map((l) => (
                  <span key={l} className="tag tag-saffron" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {l}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'block' }}>Dakshina Estimate</span>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{p.priceLabel}</strong>
                </div>
                <Link href={`/priest/${p.id}`} className="btn btn-secondary btn-sm">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link href="/ceremony-services?category=priests" className="btn btn-primary">
            View All Verified Priests →
          </Link>
        </div>
      </div>
    </section>
  );
}
