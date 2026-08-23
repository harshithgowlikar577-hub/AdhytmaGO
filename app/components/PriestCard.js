'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCeremonyButton from './AddToCeremonyButton';

export default function PriestCard({ priest }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-body" style={{ display: 'flex', gap: '16px' }}>
          {/* Clickable Priest Avatar */}
          <div 
            onClick={() => setIsZoomed(true)}
            title="Click to view larger photo"
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              background: priest.avatarColor,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              border: '2px solid var(--color-saffron-light)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,168,67,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
            }}
          >
            {priest.image ? (
              <img 
                src={priest.image} 
                alt={priest.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} 
              />
            ) : (
              '🧑'
            )}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              🔍
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: '18px' }}>{priest.name}</h3>
              {priest.verified && (
                <span className="badge badge-verified" title="Verified" style={{ padding: '2px 6px', fontSize: '10px' }}>✓</span>
              )}
            </div>
            
            <div className="card-subtitle" style={{ marginBottom: '8px' }}>
              {priest.experience} years exp • {priest.distance} km away
            </div>
            
            <div style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {priest.specialization.join(', ')}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {priest.languages.slice(0, 3).map(l => (
                <span key={l} className="tag tag-saffron" style={{ fontSize: '11px' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card-footer" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rating">
              {priest.rating} ★ <span className="rating-count">({priest.reviewCount})</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{priest.priceLabel}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/priest/${priest.id}`} className="btn btn-ghost btn-sm">
              Profile
            </Link>
            <AddToCeremonyButton item={priest} />
          </div>
        </div>
      </div>

      {/* Enlarged Photo Lightbox Modal */}
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
              padding: '28px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-saffron-light)'
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
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-gray-200)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-gray-100)'}
            >
              ✕
            </button>

            {/* Bigger Priest Photo */}
            <div style={{
              width: '230px',
              height: '230px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid var(--color-saffron)',
              boxShadow: '0 12px 28px rgba(212, 168, 67, 0.3)',
              background: priest.avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {priest.image ? (
                <img 
                  src={priest.image} 
                  alt={priest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                />
              ) : (
                <span style={{ fontSize: '72px' }}>🧑</span>
              )}
            </div>

            <h3 style={{ fontSize: '22px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              {priest.name}
            </h3>

            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', margin: '0 0 14px' }}>
              📍 {priest.location} • {priest.experience} years experience
            </p>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--color-saffron-light)', 
              color: 'var(--color-saffron-dark)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              ★ {priest.rating} ({priest.reviewCount} reviews) • {priest.priceLabel}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link 
                href={`/priest/${priest.id}`} 
                className="btn btn-primary btn-sm"
                onClick={() => setIsZoomed(false)}
                style={{ flex: 1 }}
              >
                View Full Profile & PDF
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

