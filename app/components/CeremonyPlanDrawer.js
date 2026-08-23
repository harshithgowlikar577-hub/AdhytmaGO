'use client';

import Link from 'next/link';
import { useCeremony } from '../context/CeremonyContext';
import './CeremonyPlanDrawer.css';

export default function CeremonyPlanDrawer() {
  const { 
    isDrawerOpen, 
    toggleDrawer, 
    ceremonyPlan, 
    selectedVenue, 
    selectedPriest, 
    selectedTemple,
    ceremonyType,
    removeFromCeremony 
  } = useCeremony();

  return (
    <>
      {isDrawerOpen && <div className="drawer-backdrop" onClick={toggleDrawer} />}
      
      <div className={`drawer ${isDrawerOpen ? 'drawer-open' : ''}`} id="plan-drawer">
        <div className="drawer-header">
          <h2>My Ceremony Plan</h2>
          <button className="drawer-close" onClick={toggleDrawer}>✕</button>
        </div>
        
        <div className="drawer-body">
          {ceremonyType && (
            <div className="drawer-event-context">
              <span className="event-label">Event</span>
              <span className="event-value">{ceremonyType}</span>
            </div>
          )}

          {ceremonyPlan.length === 0 ? (
            <div className="drawer-empty">
              <div className="empty-icon">📋</div>
              <h3>Your plan is empty</h3>
              <p>Start adding venues, priests, and temples to build your ceremony.</p>
              <Link href="/ceremony-services" className="btn btn-primary" onClick={toggleDrawer}>
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="plan-items">
              {/* Venue Item */}
              <div className="plan-item">
                <div className="plan-item-header">
                  <h4>🏛️ Venue</h4>
                  {selectedVenue ? (
                    <span className="plan-status plan-status-done">✓ Selected</span>
                  ) : (
                    <span className="plan-status">○ Needed</span>
                  )}
                </div>
                {selectedVenue && (
                  <div className="plan-item-card">
                    <div className="item-details">
                      <strong>{selectedVenue.name}</strong>
                      <span>{selectedVenue.location}</span>
                    </div>
                    <button 
                      className="btn-remove" 
                      onClick={() => removeFromCeremony(selectedVenue)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Priest Item */}
              <div className="plan-item">
                <div className="plan-item-header">
                  <h4>🧑 Priest</h4>
                  {selectedPriest ? (
                    <span className="plan-status plan-status-done">✓ Selected</span>
                  ) : (
                    <span className="plan-status">○ Needed</span>
                  )}
                </div>
                {selectedPriest && (
                  <div className="plan-item-card">
                    <div className="item-details">
                      <strong>{selectedPriest.name}</strong>
                      <span>{selectedPriest.specialization[0]}</span>
                    </div>
                    <button 
                      className="btn-remove" 
                      onClick={() => removeFromCeremony(selectedPriest)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Temple Item */}
              <div className="plan-item">
                <div className="plan-item-header">
                  <h4>🛕 Temple</h4>
                  {selectedTemple ? (
                    <span className="plan-status plan-status-done">✓ Selected</span>
                  ) : (
                    <span className="plan-status">○ Optional</span>
                  )}
                </div>
                {selectedTemple && (
                  <div className="plan-item-card">
                    <div className="item-details">
                      <strong>{selectedTemple.name}</strong>
                      <span>{selectedTemple.location}</span>
                    </div>
                    <button 
                      className="btn-remove" 
                      onClick={() => removeFromCeremony(selectedTemple)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {ceremonyPlan.length > 0 && (
          <div className="drawer-footer">
            <Link 
              href="/ceremony-plan" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              onClick={toggleDrawer}
            >
              Review Ceremony Plan
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
