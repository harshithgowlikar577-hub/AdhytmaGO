'use client';

import Link from 'next/link';

export default function ChecklistPreview() {
  const checklist = [
    { text: 'Confirm verified Vedic pandit for ceremony rituals', done: true, tag: 'Priest' },
    { text: 'Finalize function hall / venue booking & guest capacity', done: true, tag: 'Venue' },
    { text: 'Arrange traditional puja samagri (turmeric, kumkum, rice, ghee, kalash)', done: true, tag: 'Materials' },
    { text: 'Coordinate auspicious Muhurtham timings with pandit', done: false, tag: 'Timeline' },
    { text: 'Confirm prasadam and catering arrangements for guests', done: false, tag: 'Catering' },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2>Ceremony Preparation Checklist</h2>
          <p>Stay organized with structured preparation milestones tailored to each ceremony tradition.</p>
        </div>

        <div className="checklist-preview-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Griha Pravesham Preparation</h3>
            <span className="badge badge-verified">3 of 5 Completed</span>
          </div>

          <div className="checklist-progress-bar">
            <div className="checklist-progress-fill" style={{ width: '60%' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checklist.map((item, idx) => (
              <div key={idx} className="checklist-item-row">
                <span style={{ fontSize: '18px' }}>{item.done ? '✅' : '⚪'}</span>
                <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--color-gray-500)' : 'var(--color-gray-900)' }}>
                  {item.text}
                </span>
                <span className="tag" style={{ fontSize: '11px' }}>{item.tag}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
            <Link href="/ai" className="btn btn-primary btn-sm">
              Generate Custom Checklist for Your Ceremony →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
