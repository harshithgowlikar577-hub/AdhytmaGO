'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCeremonyButton from './AddToCeremonyButton';

export default function VenueCard({ venue }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="card">
        {/* Clickable Venue Image */}
        <div 
          onClick={() => setIsZoomed(true)}
          title="Click to view larger photo"
          className="card-image"
          style={{ 
            background: venue.imageGradient, 
            height: '180px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          {venue.image ? (
            <img 
              src={venue.image} 
              alt={venue.name} 
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
              🏛️ {venue.name}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>{venue.name}</h3>
            {venue.availability === 'available' ? (
              <span className="badge badge-success">Available</span>
            ) : (
              <span className="badge badge-warning">Request</span>
            )}
          </div>
          
          <div className="card-subtitle">
            📍 {venue.location} • {venue.distance} km away
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="tag">👥 Up to {venue.capacity} guests</span>
            {venue.facilities.slice(0, 3).map(f => (
              <span key={f} className="tag">{f}</span>
            ))}
            {venue.facilities.length > 3 && (
              <span className="tag">+{venue.facilities.length - 3} more</span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{venue.priceLabel}</div>
              <div className="rating">
                {venue.rating} ★ <span className="rating-count">({venue.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <Link href={`/venue/${venue.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            View Venue
          </Link>
          <AddToCeremonyButton item={venue} />
        </div>
      </div>

      {/* Enlarged Venue Photo Lightbox Modal */}
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
              maxWidth: '540px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-terracotta-light)'
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

            {/* Bigger Venue Photo */}
            <div style={{
              width: '100%',
              height: '300px',
              marginBottom: '16px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.15)',
              background: venue.imageGradient
            }}>
              {venue.image ? (
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🏛️
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '22px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              {venue.name}
            </h3>

            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', margin: '0 0 10px' }}>
              📍 {venue.location} • 👥 Up to {venue.capacity} guests • {venue.priceLabel}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
              <Link 
                href={`/venue/${venue.id}`} 
                className="btn btn-primary btn-sm"
                onClick={() => setIsZoomed(false)}
                style={{ flex: 1 }}
              >
                View Venue & PDF Catalog
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

