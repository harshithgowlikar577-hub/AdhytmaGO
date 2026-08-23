'use client';

import { useCeremony } from '../context/CeremonyContext';
import './ServiceCategoryTabs.css';

const categories = [
  { id: 'priests', label: 'Priests', icon: '🙏', description: 'Find verified priests' },
  { id: 'temples', label: 'Temples', icon: '🛕', description: 'Discover nearby temples' },
  { id: 'venues', label: 'Function Halls', icon: '🏛️', description: 'Find ceremony venues' },
];

const radiusOptions = [1, 5, 10, 25];

export default function ServiceCategoryTabs() {
  const { selectedCategory, setCategory, searchRadius, setSearchRadius } = useCeremony();

  return (
    <div className="category-tabs-wrapper" id="category-tabs">
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'category-tab-active' : ''}`}
            onClick={() => setCategory(cat.id)}
            id={`tab-${cat.id}`}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span className="tab-label">{cat.label}</span>
            {selectedCategory === cat.id && (
              <span className="tab-indicator" />
            )}
          </button>
        ))}
      </div>

      <div className="radius-selector">
        <span className="radius-label">Nearby within</span>
        <select
          className="select-field radius-select"
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          id="radius-select"
        >
          {radiusOptions.map((r) => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
      </div>
    </div>
  );
}
