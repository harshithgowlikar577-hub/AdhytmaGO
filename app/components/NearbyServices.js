'use client';

import { useCeremony } from '../context/CeremonyContext';
import './NearbyServices.css';

export default function NearbyServices() {
  const { selectedCategory, setCategory, selectedVenue, selectedPriest, selectedTemple } = useCeremony();

  // Determine what to cross-sell based on the current category
  let title = "Complete Your Ceremony";
  let recommendations = [];

  if (selectedCategory === 'venues') {
    recommendations = [
      { id: 'priests', label: 'Find Nearby Priests', desc: 'Verified priests available near this venue', icon: '🧑', anchor: selectedVenue }
    ];
    if (!selectedTemple) {
      recommendations.push({ id: 'temples', label: 'Explore Temples', desc: 'Temples and services near your venue', icon: '🛕', anchor: selectedVenue });
    }
  } else if (selectedCategory === 'priests') {
    recommendations = [
      { id: 'venues', label: 'Find Function Halls', desc: 'Suitable venues for your ceremony', icon: '🏛️', anchor: selectedPriest }
    ];
    if (!selectedTemple) {
      recommendations.push({ id: 'temples', label: 'Explore Temples', desc: 'Nearby temples and services', icon: '🛕', anchor: selectedPriest });
    }
  } else if (selectedCategory === 'temples') {
    recommendations = [
      { id: 'priests', label: 'Find Priests', desc: 'Verified priests near this temple', icon: '🧑', anchor: selectedTemple },
      { id: 'venues', label: 'Find Function Halls', desc: 'Venues near this temple', icon: '🏛️', anchor: selectedTemple }
    ];
  }

  // Only show recommendations if an item in the current category has been selected (creating an anchor)
  const currentAnchor = selectedCategory === 'venues' ? selectedVenue : 
                        selectedCategory === 'priests' ? selectedPriest : 
                        selectedTemple;

  if (!currentAnchor) return null;

  return (
    <div className="nearby-services">
      <h3 className="nearby-title">{title}</h3>
      <div className="nearby-grid">
        {recommendations.map((rec) => (
          <div key={rec.id} className="nearby-card" onClick={() => setCategory(rec.id)}>
            <div className="nearby-icon">{rec.icon}</div>
            <div className="nearby-content">
              <h4>{rec.label}</h4>
              <p>{rec.desc}</p>
            </div>
            <div className="nearby-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
