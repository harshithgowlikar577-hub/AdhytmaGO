'use client';

import Link from 'next/link';

export default function ServiceCards() {
  const services = [
    {
      id: 'priests',
      title: 'Priest Booking',
      desc: 'Discover verified pandits by language, ceremony specialization, experience, and real-time availability.',
      cta: 'Find a Priest →',
      href: '/ceremony-services?category=priests',
      icon: '🧑',
      gradient: 'linear-gradient(135deg, #FFE8CC 0%, #D4A843 100%)',
    },
    {
      id: 'temples',
      title: 'Temple Pooja & Sevas',
      desc: 'Explore sacred temples, verified daily pooja timings, special homams, and book seva slots.',
      cta: 'Explore Temples →',
      href: '/ceremony-services?category=temples',
      icon: '🛕',
      gradient: 'linear-gradient(135deg, #E0E8F0 0%, #7A9E7E 100%)',
    },
    {
      id: 'venues',
      title: 'Function Halls',
      desc: 'Discover premium kalyana mandapams and ceremony venues filtered by guest capacity and amenities.',
      cta: 'Find Venues →',
      href: '/ceremony-services?category=venues',
      icon: '🏛️',
      gradient: 'linear-gradient(135deg, #F5E6D3 0%, #C4704B 100%)',
    },
    {
      id: 'planning',
      title: 'Ceremony Planning',
      desc: 'Get structured checklists, puja samagri requirements, muhurtham timelines, and AI ritual assistance.',
      cta: 'Plan Ceremony →',
      href: '/ai',
      icon: '✨',
      gradient: 'linear-gradient(135deg, #FFF0D4 0%, #E8B04B 100%)',
    },
  ];

  return (
    <section className="section" id="services-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>One Place for Your Entire Ceremony</h2>
          <p>Everything you need for your sacred occasions — from rituals and pandits to venues and preparation guidance.</p>
        </div>

        <div className="services-4-grid">
          {services.map((svc) => (
            <Link key={svc.id} href={svc.href} className="service-card-item">
              <div>
                <div className="service-card-icon" style={{ background: svc.gradient }}>
                  {svc.icon}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  {svc.title}
                </h3>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                  {svc.desc}
                </p>
              </div>
              <span style={{ color: 'var(--color-saffron-dark)', fontWeight: 600, fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)', display: 'inline-block' }}>
                {svc.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
