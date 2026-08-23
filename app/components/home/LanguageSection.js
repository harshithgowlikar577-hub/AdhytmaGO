'use client';

import { useCeremony } from '../../context/CeremonyContext';

export default function LanguageSection() {
  const { language, setLanguage } = useCeremony();

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-gray-50)' }}>
      <div className="container">
        <div className="language-promo-card">
          <div>
            <span className="badge badge-verified" style={{ marginBottom: '12px', display: 'inline-block' }}>
              🌐 Multilingual Platform
            </span>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Built for Telangana & Andhra Pradesh
            </h2>
            <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              Plan your rituals seamlessly in English or Telugu (తెలుగు). Our AI assistant and provider network support native Telugu ceremonies, South Indian traditions, and bilingual communication.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className={`btn ${language !== 'Telugu' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLanguage('English')}
              >
                English (EN)
              </button>
              <button
                className={`btn ${language === 'Telugu' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLanguage('Telugu')}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', background: 'white' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              {language === 'Telugu' ? 'ఉదాహరణ ప్రశ్నలు (Sample Queries):' : 'Sample Multilingual Queries:'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', fontSize: '13px', borderLeft: '3px solid var(--color-saffron)' }}>
                "హైదరాబాద్‌లో గృహప్రవేశానికి తెలుగు పురోహితుడు కావాలి"
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', fontSize: '13px', borderLeft: '3px solid var(--color-terracotta)' }}>
                "Looking for a 500-capacity Kalyana Mandapam in Jubilee Hills"
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', fontSize: '13px', borderLeft: '3px solid var(--color-sage)' }}>
                "గచ్చిబౌలి దగ్గర ఉన్న వెంకటేశ్వర స్వామి గుడి పూజ సమయాలు"
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
