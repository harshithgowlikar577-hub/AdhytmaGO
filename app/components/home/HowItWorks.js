'use client';

export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Tell Us What You Need',
      desc: 'Describe your ceremony in plain English or Telugu, or browse services by location.',
      icon: '💬',
    },
    {
      num: '2',
      title: 'Discover & Compare',
      desc: 'Get matched with verified Vedic pandits, suitable halls, and nearby sacred temples.',
      icon: '🔍',
    },
    {
      num: '3',
      title: 'Plan with Confidence',
      desc: 'Build your customized ceremony checklist and review transparent dakshina pricing.',
      icon: '📋',
    },
    {
      num: '4',
      title: 'Book & Transact Safely',
      desc: 'Confirm availability, secure your dates, and complete server-verified transactions.',
      icon: '🔒',
    },
  ];

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-gray-50)' }} id="how-it-works">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>How AdhyatmaGO Works</h2>
          <p>A seamless, respectful journey from discovering traditions to conducting your sacred ceremony.</p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step) => (
            <div key={step.num} className="how-step-card animate-fade-in-up">
              <div className="how-step-num">{step.num}</div>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{step.icon}</div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                {step.title}
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
