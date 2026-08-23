'use client';

import { useCeremony } from '../context/CeremonyContext';

export default function AddToCeremonyButton({ item }) {
  const { ceremonyPlan, addToCeremony, removeFromCeremony } = useCeremony();
  
  const isAdded = ceremonyPlan.some(p => p.id === item.id && p.type === item.type);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAdded) {
      removeFromCeremony(item);
    } else {
      addToCeremony(item);
    }
  };

  if (isAdded) {
    return (
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={handleClick}
        style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
      >
        <span>✓ Added to Plan</span>
      </button>
    );
  }

  return (
    <button 
      className="btn btn-primary btn-sm" 
      onClick={handleClick}
    >
      Add to Ceremony
    </button>
  );
}
