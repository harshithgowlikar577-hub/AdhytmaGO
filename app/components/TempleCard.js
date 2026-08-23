'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCeremonyButton from './AddToCeremonyButton';

export default function TempleCard({ temple }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="card">
        {/* Clickable Temple Image */}
        <div 
          onClick={() => setIsZoomed(true)}
          title="Click to view larger photo"
          className="card-image"
          style={{ 
            background: temple.imageGradient, 
            height: '170px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          {temple.image ? (
            <img 
              src={temple.image} 
              alt={temple.name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              🛕 {temple.name}
            </div>
          )}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.65)',
            color: 'white',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            backdropFilter: 'blur(4px)'
          }}>
            🔍
          </div>
        </div>
        
        <div className="card-body">
          <h3 className="card-title" style={{ marginBottom: '4px' }}>{temple.name}</h3>
          
          <div className="card-subtitle">
            📍 {temple.location} • {temple.distance} km away
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            <span>🕒 {temple.timings}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {temple.services.slice(0, 3).map(s => (
              <span key={s} className="tag" style={{ background: 'var(--color-sage-light)', color: 'var(--color-gray-900)' }}>{s}</span>
            ))}
            {temple.services.length > 3 && (
              <span className="tag">+{temple.services.length - 3}</span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="rating">
              {temple.rating} ★ <span className="rating-count">({temple.reviewCount})</span>
            </div>
            {temple.accessibility && (
              <span title="Wheelchair Accessible" style={{ fontSize: '18px' }}>♿</span>
            )}
          </div>
        </div>
        
        <div className="card-footer">
          <Link href={`/temple/${temple.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            View Temple
          </Link>
          <AddToCeremonyButton item={temple} />
        </div>
      </div>

      {/* Enlarged Temple Photo Lightbox Modal */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
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
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-sage-light)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsZoomed(false)}
              aria-label="Close enlarged photo"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--color-gray-100)',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer',
                color: 'var(--color-gray-700)',
                zIndex: 2,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-gray-200)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-gray-100)'}
            >
              ✕
            </button>

            {/* Bigger Temple Photo */}
            <div style={{
              width: '100%',
              height: '280px',
              marginBottom: '16px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.15)',
              background: temple.imageGradient
            }}>
              {temple.image ? (
                <img 
                  src={temple.image} 
                  alt={temple.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🛕
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '22px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              {temple.name}
            </h3>

            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', margin: '0 0 10px' }}>
              📍 {temple.location} • 🕒 {temple.timings}
            </p>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--color-sage-light)', 
              color: 'var(--color-gray-900)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px'
            }}>
              ★ {temple.rating} ({temple.reviewCount} reviews)
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link 
                href={`/temple/${temple.id}`} 
                className="btn btn-primary btn-sm"
                onClick={() => setIsZoomed(false)}
                style={{ flex: 1 }}
              >
                View Temple Details
              </Link>
              <button 
                onClick={() => setIsZoomed(false)} 
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

