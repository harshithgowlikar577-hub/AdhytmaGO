'use client';

import Link from 'next/link';
import { useCeremony } from '../../context/CeremonyContext';
import { useRouter } from 'next/navigation';

export default function FeaturedCeremonies() {
  const { setCeremonyType } = useCeremony();
  const router = useRouter();

  const ceremonyCategories = [
    {
      id: 1,
      name: 'Griha Pravesham',
      english: 'Housewarming',
      desc: 'Purify and sanctify your new living space with traditional Vastu and Navagraha blessings.',
      tradition: 'Hindu — South Indian',
      icon: '🏡',
      accent: 'var(--color-saffron)',
      image: '/images/grihapravesham.jpg',
    },
    {
      id: 2,
      name: 'Vivaha',
      english: 'Wedding Ceremonies',
      desc: 'Sacred Vedic wedding rituals, Saptapadi, and Kalyanam arrangements with senior pandits.',
      tradition: 'Hindu Vedic',
      icon: '💍',
      accent: 'var(--color-terracotta)',
      image: '/images/vivaha.jpg',
    },
    {
      id: 3,
      name: 'Namakaranam',
      english: 'Naming Ceremony',
      desc: 'Formally name your newborn child with planetary blessings, cradle ceremonies, and rituals.',
      tradition: 'Hindu',
      icon: '👶',
      accent: 'var(--color-sage)',
      image: '/images/namakaranam.jpg',
    },
    {
      id: 4,
      name: 'Vidyarambham',
      english: 'Educational Blessing',
      desc: 'Auspicious initiation into the world of alphabets, learning, Saraswati puja, and knowledge.',
      tradition: 'South Indian Tradition',
      icon: '📚',
      accent: 'var(--color-gold)',
      image: '/images/vidyarambham.jpg',
    },
  ];

  const handleSelect = (ceremony) => {
    setCeremonyType(`${ceremony.name} (${ceremony.english})`);
    router.push('/ceremony-services?category=priests');
  };

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-gray-50)' }} id="ceremonies-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>Sacred Ceremony Categories</h2>
          <p>Explore traditional ceremonies suited to your family occasion. Easily extensible for all Vedic and regional traditions.</p>
        </div>

        <div className="ceremonies-grid">
          {ceremonyCategories.map((c) => (
            <div
              key={c.id}
              className="ceremony-category-card"
              style={{ borderTop: `4px solid ${c.accent}`, cursor: 'pointer', padding: '0 0 var(--space-6) 0', overflow: 'hidden' }}
              onClick={() => handleSelect(c)}
            >
              <div className="ceremony-image-wrapper">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="ceremony-card-image" />
                ) : (
                  <div className="ceremony-card-placeholder" style={{ backgroundColor: `${c.accent}15` }}>
                    <span>{c.icon}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '0 var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '4px 0' }}>{c.name}</h3>
                <div style={{ color: 'var(--color-saffron-dark)', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  {c.english} • {c.tradition}
                </div>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                  {c.desc}
                </p>
                <span className="btn-ghost btn-sm" style={{ padding: 0, color: 'var(--color-saffron-dark)' }}>
                  Find Priests & Venues →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
