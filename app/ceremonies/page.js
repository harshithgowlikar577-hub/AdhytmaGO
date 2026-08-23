'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCeremony } from '../context/CeremonyContext';
import { ceremonyTypes } from '../data/mockData';

export default function CeremoniesPage() {
  const router = useRouter();
  const { setCeremonyType } = useCeremony();

  const handleSelect = (ceremony) => {
    setCeremonyType(ceremony);
    router.push('/ceremony-services?category=priests');
  };

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
      <div className="section-header animate-fade-in">
        <h1>Explore Sacred Ceremonies</h1>
        <p>Select any ceremony to discover verified Vedic pandits, suitable venues, and ritual guidance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
        {ceremonyTypes.map((c, idx) => (
          <div
            key={idx}
            className="card"
            style={{ padding: 'var(--space-6)', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => handleSelect(c)}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕉️</div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '6px' }}>{c}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)', marginBottom: '16px' }}>
              Traditional Vedic ritual with certified pandits and custom preparation checklist.
            </p>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Find Priests & Venues →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
