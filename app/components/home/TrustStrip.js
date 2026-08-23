'use client';

export default function TrustStrip() {
  const items = [
    { icon: '🛡️', label: 'Verified Vedic Priests' },
    { icon: '₹', label: 'Transparent Dakshina & Pricing' },
    { icon: '📋', label: 'Preparation Checklists' },
    { icon: '🌐', label: 'English & Telugu Support' },
  ];

  return (
    <section className="trust-strip-section">
      <div className="container">
        <div className="trust-strip-grid">
          {items.map((item, idx) => (
            <div key={idx} className="trust-strip-item animate-fade-in">
              <span className="trust-strip-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
