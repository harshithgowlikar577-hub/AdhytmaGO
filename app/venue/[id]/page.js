'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { venues } from '../../data/mockData';
import AddToCeremonyButton from '../../components/AddToCeremonyButton';

const venueCatalogImages = [
  '/images/venues/venue_1.jpg',
  '/images/venues/venue_2.jpg',
  '/images/venues/venue_3.jpg',
  '/images/venues/venue_4.jpg',
  '/images/venues/venue_5.jpg',
];

export default function VenuePage({ params }) {
  const id = use(params).id;
  const venue = venues.find(v => v.id === id);
  const [showPdf, setShowPdf] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  if (!venue) {
    notFound();
  }

  const pdfPath = venue.pdfUrl || '/pdfs/function-halls.pdf';

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <Link href="/ceremony-services?category=venues" className="btn-ghost" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>← Back to Venues</Link>
      
      {/* Hero Image Section */}
      <div 
        style={{ 
          height: '400px', 
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          overflow: 'hidden',
          position: 'relative',
          background: venue.imageGradient,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        {venue.image ? (
          <img 
            src={venue.image} 
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            🏛️ {venue.name}
          </div>
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          padding: 'var(--space-6)',
          color: 'white'
        }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{venue.name}</h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>📍 {venue.location}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-md)', margin: 0 }}>📍 {venue.location} • {venue.distance} km from your selected location</p>
            </div>
            {venue.availability === 'available' ? (
              <span className="badge badge-success">Available</span>
            ) : (
              <span className="badge badge-warning">Request Only</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div className="rating" style={{ fontSize: 'var(--text-lg)' }}>
              {venue.rating} ★ <span className="rating-count">({venue.reviewCount} reviews)</span>
            </div>
            <div>👥 Capacity: Up to {venue.capacity} guests</div>
            {venue.verified && <div style={{ color: 'var(--color-info)', fontWeight: 600 }}>✓ Verified Venue</div>}
          </div>

          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>About</h2>
          <p style={{ lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>{venue.description}</p>

          <h2 style={{ fontSize: 'var(--text-xl)', margin: 'var(--space-8) 0 var(--space-3)' }}>Facilities</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            {venue.facilities.map(f => (
              <span key={f} className="tag" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }}>✓ {f}</span>
            ))}
          </div>

          {/* Function Hall Photos Gallery from PDF */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>Venue Photo Gallery</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
          }}>
            {venueCatalogImages.map((imgSrc, idx) => (
              <div key={idx} style={{ 
                height: '130px', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                border: imgSrc === venue.image ? '2px solid var(--color-saffron)' : '1px solid var(--color-gray-200)'
              }}>
                <img src={imgSrc} alt={`Venue catalog photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* Function Halls PDF Section */}
          <div style={{ 
            background: 'var(--color-cream)', 
            border: '1px solid var(--color-terracotta-light)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-terracotta)' }}>📄 Function Halls PDF Catalog</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
                  View full brochure, layout blueprints, and venue options extracted from official Function Halls PDF catalog.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button 
                  onClick={() => setShowPdf(!showPdf)} 
                  className="btn btn-secondary btn-sm"
                >
                  {showPdf ? 'Hide PDF Preview' : '👁️ Preview PDF inside page'}
                </button>
                <a 
                  href={pdfPath} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary btn-sm"
                >
                  📥 Download / Open PDF
                </a>
              </div>
            </div>

            {showPdf && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <iframe 
                  src={pdfPath} 
                  title="Function Halls PDF Catalog"
                  style={{ 
                    width: '100%', 
                    height: '500px', 
                    border: '1px solid var(--color-gray-300)', 
                    borderRadius: 'var(--radius-lg)' 
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))' }}>
            <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{venue.priceLabel}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Base pricing for standard packages. Final price depends on date and specific requirements.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <AddToCeremonyButton item={venue} />
              <button 
                className="btn btn-secondary"
                onClick={() => { setShowContactModal(true); setInquirySent(false); }}
                id="contact-venue-btn"
              >
                Contact Venue
              </button>
              <a 
                href={pdfPath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm" 
                style={{ textAlign: 'center', display: 'block', marginTop: 'var(--space-2)' }}
              >
                📄 Download Function Halls PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Venue Modal */}
      {showContactModal && (
        <div
          onClick={() => setShowContactModal(false)}
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
              border: '1px solid var(--color-terracotta-light)'
            }}
          >
            <button
              onClick={() => setShowContactModal(false)}
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

            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏛️</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              Contact {venue.name}
            </h3>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '13px', margin: '0 0 16px' }}>
              📍 {venue.location} • Up to {venue.capacity} guests • {venue.priceLabel}
            </p>

            {inquirySent ? (
              <div style={{ background: 'var(--color-cream)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-terracotta)' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                <strong style={{ display: 'block', color: 'var(--color-terracotta)', marginBottom: '4px' }}>
                  Inquiry Sent to Venue Manager!
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', margin: 0 }}>
                  The venue coordinator will reach out to confirm hall availability and date slots.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '12px' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Facilities:</strong> {venue.facilities.join(', ')}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Capacity:</strong> {venue.capacity} guests</div>
                  <div><strong>Status:</strong> <span style={{ color: venue.availability === 'available' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>{venue.availability === 'available' ? 'Available for booking' : 'Request only'}</span></div>
                </div>

                <button
                  className="btn btn-primary btn-md"
                  onClick={() => setInquirySent(true)}
                  style={{ width: '100%' }}
                >
                  Send Date & Pricing Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

