'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { temples } from '../../data/mockData';
import AddToCeremonyButton from '../../components/AddToCeremonyButton';

export default function TemplePage({ params }) {
  const id = use(params).id;
  const temple = temples.find(t => t.id === id);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (!temple) {
    notFound();
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <Link href="/ceremony-services?category=temples" className="btn-ghost" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>← Back to Temples</Link>
      
      <div 
        style={{ 
          height: '350px', 
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          overflow: 'hidden',
          position: 'relative',
          background: temple.imageGradient,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        {temple.image ? (
          <img 
            src={temple.image} 
            alt={temple.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            🛕 {temple.name}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{temple.name}</h1>
          <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }}>📍 {temple.location} • {temple.distance} km away</p>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div className="rating" style={{ fontSize: 'var(--text-lg)' }}>
              {temple.rating} ★ <span className="rating-count">({temple.reviewCount} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              🕒 {temple.timings}
            </div>
          </div>

          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>About</h2>
          <p style={{ lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>{temple.description}</p>

          <h2 style={{ fontSize: 'var(--text-xl)', margin: 'var(--space-8) 0 var(--space-3)' }}>Services Available</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {temple.services.map(s => (
              <span key={s} className="tag" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', background: 'var(--color-sage-light)', color: 'var(--color-gray-900)' }}>{s}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Plan your visit</h3>
            
            <div style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {temple.accessibility && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  <span style={{ fontSize: '1.25rem' }}>♿</span> Wheelchair Accessible
                </div>
              )}
              {temple.availability === 'available' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  <span style={{ fontSize: '1.25rem', color: 'var(--color-success)' }}>✓</span> Open for bookings
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <AddToCeremonyButton item={temple} />
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(true)}
                id="temple-details-btn"
              >
                Temple Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Temple Details Modal */}
      {showDetailsModal && (
        <div
          onClick={() => setShowDetailsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-sage-light)'
            }}
          >
            <button
              onClick={() => setShowDetailsModal(false)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--color-gray-100)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛕</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              {temple.name}
            </h3>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '13px', margin: '0 0 16px' }}>
              📍 {temple.location} • 🕒 {temple.timings}
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}><strong>Daily Darshan Timings:</strong><br/>{temple.timings}</div>
              <div style={{ marginBottom: '8px' }}><strong>Available Sevas:</strong><br/>{temple.services.join(' • ')}</div>
              <div><strong>Accessibility:</strong> {temple.accessibility ? '♿ Wheelchair Accessible' : 'Standard Access'}</div>
            </div>

            <button
              className="btn btn-primary btn-md"
              onClick={() => setShowDetailsModal(false)}
              style={{ width: '100%' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
