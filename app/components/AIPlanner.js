'use client';

import { useState } from 'react';
import { useCeremony } from '../context/CeremonyContext';
import './AIPlanner.css';

export default function AIPlanner() {
  const { 
    aiQuery, 
    setAiQuery, 
    setCeremonyType, 
    setGuestCount, 
    setLocation, 
    setCategory,
    aiResults,
    setAiResults
  } = useCeremony();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI extraction and response
    setTimeout(() => {
      // Very basic mock logic for demo
      const q = aiQuery.toLowerCase();
      let type = 'Ceremony';
      if (q.includes('housewarming') || q.includes('griha')) type = 'Griha Pravesham (Housewarming)';
      if (q.includes('wedding') || q.includes('marriage')) type = 'Wedding Ceremony';
      if (q.includes('naming')) type = 'Naming Ceremony';
      
      let guests = '100';
      const guestMatch = q.match(/(\d+)\s*(people|guests)/i);
      if (guestMatch) guests = guestMatch[1];
      
      // Update context state
      setCeremonyType(type);
      if (parseInt(guests) >= 500) setGuestCount('500+');
      else if (parseInt(guests) >= 250) setGuestCount('250');
      else if (parseInt(guests) >= 100) setGuestCount('100');
      else setGuestCount('50');

      setAiResults({
        type,
        guests,
        priestsCount: 3,
        venuesCount: 6,
        templesCount: 4
      });
      
      setIsProcessing(false);
    }, 1500);
  };

  const clearResults = () => {
    setAiQuery('');
    setAiResults(null);
  };

  return (
    <div className="ai-planner card">
      <div className="ai-header">
        <h3>Not sure what you need?</h3>
        <p>Tell our assistant about your ceremony</p>
      </div>

      {!aiResults ? (
        <form className="ai-form" onSubmit={handleSearch}>
          <div className="ai-input-wrapper">
            <span className="ai-icon">✨</span>
            <input 
              type="text" 
              className="ai-input" 
              placeholder="e.g. I am planning a housewarming for 150 people in Hyderabad"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              className={`btn btn-primary btn-sm ai-btn ${isProcessing ? 'processing' : ''}`}
              disabled={isProcessing || !aiQuery.trim()}
            >
              {isProcessing ? 'Analyzing...' : 'Plan'}
            </button>
          </div>
        </form>
      ) : (
        <div className="ai-results animate-fade-in-down">
          <div className="ai-results-header">
            <h4>Your extracted setup</h4>
            <button className="btn-ghost btn-sm" onClick={clearResults}>Clear</button>
          </div>
          
          <div className="ai-extraction">
            <div className="ai-tag"><strong>Event:</strong> {aiResults.type}</div>
            <div className="ai-tag"><strong>Guests:</strong> {aiResults.guests}</div>
          </div>
          
          <div className="ai-recommendations">
            <div className="ai-rec-card" onClick={() => setCategory('priests')}>
              <span className="rec-icon">🧑</span>
              <div className="rec-info">
                <strong>Priests</strong>
                <span>{aiResults.priestsCount} suitable options</span>
              </div>
            </div>
            <div className="ai-rec-card" onClick={() => setCategory('venues')}>
              <span className="rec-icon">🏛️</span>
              <div className="rec-info">
                <strong>Venues</strong>
                <span>{aiResults.venuesCount} suitable halls</span>
              </div>
            </div>
            <div className="ai-rec-card" onClick={() => setCategory('temples')}>
              <span className="rec-icon">🛕</span>
              <div className="rec-info">
                <strong>Temples</strong>
                <span>{aiResults.templesCount} nearby options</span>
              </div>
            </div>
          </div>
          
          <div className="ai-disclaimer">
            Practices may vary by tradition, region and family preference. Confirm important details with a qualified practitioner.
          </div>
        </div>
      )}
    </div>
  );
}
