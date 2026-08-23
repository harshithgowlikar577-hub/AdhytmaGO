'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { priests } from '../../data/mockData';
import AddToCeremonyButton from '../../components/AddToCeremonyButton';

const priestCatalogImages = [
  '/images/priests/priest_1.jpg',
  '/images/priests/priest_2.jpg',
  '/images/priests/priest_3.jpg',
  '/images/priests/priest_4.jpg',
  '/images/priests/priest_5.jpg',
  '/images/priests/priest_6.jpg',
];

export default function PriestPage({ params }) {
  const id = use(params).id;
  const priest = priests.find(p => p.id === id);
  const [showPdf, setShowPdf] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  if (!priest) {
    notFound();
  }

  const pdfPath = priest.pdfUrl || '/pdfs/pandits.pdf';

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <Link href="/ceremony-services?category=priests" className="btn-ghost" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>← Back to Priests</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', alignItems: 'center' }}>
            {/* Clickable Profile Photo */}
            <div
              onClick={() => setZoomedImage(priest.image || null)}
              title="Click to view larger photo"
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: priest.avatarColor,
                flexShrink: 0,
                border: '4px solid var(--color-saffron-light)',
                boxShadow: '0 8px 20px rgba(212,168,67,0.2)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {priest.image ? (
                <img
                  src={priest.image}
                  alt={priest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: 'white' }}>
                  🧑
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                🔍
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', margin: 0 }}>{priest.name}</h1>
                {priest.verified && (
                  <span className="badge badge-verified" style={{ padding: 'var(--space-1) var(--space-2)' }}>✓ Verified</span>
                )}
              </div>
              <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-lg)', margin: '4px 0' }}>
                {priest.experience} years experience • {priest.distance} km away
              </p>
              <div className="rating" style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-2)' }}>
                {priest.rating} ★ <span className="rating-count">({priest.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>About</h2>
          <p style={{ lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>{priest.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>Specializations</h2>
              <ul style={{ paddingLeft: 'var(--space-4)', lineHeight: 1.8 }}>
                {priest.specialization.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>Languages</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {priest.languages.map(l => (
                  <span key={l} className="tag tag-saffron" style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Pandits Profile Gallery from PDF */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>Verified Pandits Directory</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
          }}>
            {priestCatalogImages.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setZoomedImage(imgSrc)}
                title="Click to view larger photo"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-3)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: imgSrc === priest.image ? '2px solid var(--color-saffron)' : '1px solid var(--color-gray-200)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <img
                  src={imgSrc}
                  alt={`Pandit photo ${idx + 1}`}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 15%', margin: '0 auto var(--space-2)' }}
                />
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                  Pandit #{idx + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Pandits PDF Section */}
          <div style={{
            background: 'var(--color-cream)',
            border: '1px solid var(--color-saffron-light)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-saffron-dark)' }}>📄 Pandits PDF Directory Catalog</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
                  Access profiles, credentials, and full details extracted from official Pandits PDF catalog.
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
                  title="Pandits PDF Catalog"
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
            <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{priest.priceLabel}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Dakshina estimate. Final amount depends on the type and duration of the ceremony.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <AddToCeremonyButton item={priest} />
              <button 
                className="btn btn-secondary"
                onClick={() => { setShowContactModal(true); setInquirySent(false); }}
                id="contact-priest-btn"
              >
                Contact Pandit Ji
              </button>
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ textAlign: 'center', display: 'block', marginTop: 'var(--space-2)' }}
              >
                📄 Download Pandits PDF Catalog
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Pandit Ji Modal */}
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
              border: '1px solid var(--color-saffron-light)'
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

            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🙏</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              Contact {priest.name}
            </h3>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '13px', margin: '0 0 16px' }}>
              📍 {priest.location} • {priest.experience} yrs exp • {priest.priceLabel}
            </p>

            {inquirySent ? (
              <div style={{ background: 'var(--color-cream)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-saffron)' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                <strong style={{ display: 'block', color: 'var(--color-saffron-dark)', marginBottom: '4px' }}>
                  Consultation Request Sent!
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', margin: 0 }}>
                  Pandit Ji’s coordinator will contact you via WhatsApp / Phone for Muhurtham alignment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '12px' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Languages:</strong> {priest.languages.join(', ')}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Ritual Specialties:</strong> {priest.specialization.slice(0, 2).join(', ')}</div>
                  <div><strong>Availability:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active for Bookings</span></div>
                </div>

                <button
                  className="btn btn-primary btn-md"
                  onClick={() => setInquirySent(true)}
                  style={{ width: '100%' }}
                >
                  Send Consultation Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
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
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-saffron-light)'
            }}
          >
            <button
              onClick={() => setZoomedImage(null)}
              aria-label="Close enlarged photo"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
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
                color: 'var(--color-gray-700)'
              }}
            >
              ✕
            </button>

            <div style={{
              width: '260px',
              height: '260px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid var(--color-saffron)',
              boxShadow: '0 12px 28px rgba(212, 168, 67, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={zoomedImage}
                alt="Enlarged Pandit"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
              />
            </div>

            <h3 style={{ fontSize: '20px', margin: '0 0 6px', color: 'var(--color-gray-900)' }}>
              Verified Pandit Ji
            </h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '13px', margin: '0 0 16px' }}>
              Vedic Ceremony Specialist • Verified Directory
            </p>

            <button
              onClick={() => setZoomedImage(null)}
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '120px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

