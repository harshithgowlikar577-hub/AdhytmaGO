'use client';

import { useCeremony } from '../context/CeremonyContext';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { ceremonyPlan, isFilterOpen, toggleFilter, isMapExpanded, toggleMap, toggleDrawer } = useCeremony();
  const planCount = ceremonyPlan.length;

  return (
    <div className="mobile-bottom-nav">
      <button 
        className={`nav-item ${isMapExpanded ? 'active' : ''}`}
        onClick={toggleMap}
      >
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Map</span>
      </button>

      <button 
        className={`nav-item ${!isMapExpanded && !isFilterOpen ? 'active' : ''}`}
        onClick={() => {
          if (isMapExpanded) toggleMap();
          if (isFilterOpen) toggleFilter();
        }}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">List</span>
      </button>

      <button 
        className={`nav-item ${isFilterOpen ? 'active' : ''}`}
        onClick={toggleFilter}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-label">Filters</span>
      </button>

      <button 
        className="nav-item plan-nav-item"
        onClick={toggleDrawer}
      >
        <div style={{ position: 'relative' }}>
          <span className="nav-icon">✨</span>
          {planCount > 0 && (
            <span className="nav-badge">{planCount}</span>
          )}
        </div>
        <span className="nav-label">My Plan</span>
      </button>
    </div>
  );
}
