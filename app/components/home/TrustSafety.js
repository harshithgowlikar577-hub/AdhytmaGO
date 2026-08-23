'use client';

export default function TrustSafety() {
  const principles = [
    {
      title: 'Verified Guidance',
      desc: 'Ritual guidelines, samagri requirements, and traditions are verified with senior Vedic scholars.',
      icon: '📖',
    },
    {
      title: 'Regional & Traditional Respect',
      desc: 'We acknowledge variations across Smartha, Vaishnava, regional traditions, and family customs.',
      icon: '🕉️',
    },
    {
      title: 'Human Practitioner Confirmation',
      desc: 'All important astrological and ceremonial specifics are confirmed directly with your chosen pandit.',
      icon: '🧑‍🤝‍🧑',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>Trust, Authenticity & Safety</h2>
          <p>AdhyatmaGO bridges sacred traditions with modern convenience while maintaining the highest spiritual integrity.</p>
        </div>

        <div className="trust-principles-grid">
          {principles.map((p, idx) => (
            <div key={idx} className="trust-principle-card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{p.icon}</div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                {p.title}
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
