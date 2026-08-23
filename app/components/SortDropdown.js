'use client';

import { useCeremony } from '../context/CeremonyContext';

export default function SortDropdown() {
  const { sortBy, setSortBy } = useCeremony();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>Sort by:</span>
      <select 
        className="select-field" 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        style={{ background: 'transparent', border: 'none', paddingLeft: 0, fontWeight: 600, color: 'var(--color-charcoal)' }}
      >
        <option value="recommended">Recommended</option>
        <option value="nearest">Nearest</option>
        <option value="rating">Highest Rated</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="availability">Availability</option>
      </select>
    </div>
  );
}
