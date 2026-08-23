'use client';

import { useState, useRef, useEffect } from 'react';
import { useCeremony } from '../context/CeremonyContext';
import { locations } from '../data/mockData';
import './LocationSelector.css';

export default function LocationSelector({ compact = false }) {
  const { location, setLocation, isLocationModalOpen, toggleLocationModal } = useCeremony();
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [recentLocations] = useState([
    locations[0], // Gachibowli
    locations[2], // Madhapur
    locations[4], // Jubilee Hills
  ]);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (search.trim()) {
      const filtered = locations.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [search]);

  useEffect(() => {
    if (isLocationModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLocationModalOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        toggleLocationModal();
      }
    }
    if (isLocationModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLocationModalOpen, toggleLocationModal]);

  const handleSelectLocation = (loc) => {
    setLocation({ name: loc.city || loc.name, area: loc.area, lat: loc.lat, lng: loc.lng });
    setSearch('');
    toggleLocationModal();
  };

  const handleUseCurrentLocation = () => {
    setLocation({ name: 'Hyderabad, Telangana', area: 'Current Location', lat: 17.385, lng: 78.4867 });
    toggleLocationModal();
  };

  return (
    <div className={`location-selector ${compact ? 'location-selector-compact' : ''}`} id="location-selector">
      <button
        className="location-display"
        onClick={toggleLocationModal}
        id="location-display-btn"
      >
        <span className="location-pin">📍</span>
        <div className="location-info">
          <span className="location-area">{location.area || 'Select Location'}</span>
          <span className="location-city">{location.name}</span>
        </div>
        <span className="location-change">Change</span>
      </button>

      {isLocationModalOpen && (
        <>
          <div className="location-backdrop" />
          <div className="location-modal animate-fade-in-down" ref={modalRef} id="location-modal">
            <div className="location-modal-header">
              <h3>Choose your location</h3>
              <button className="location-close" onClick={toggleLocationModal}>✕</button>
            </div>

            <div className="location-search-box">
              <span className="search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for area, locality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="location-search-input"
                id="location-search-input"
              />
            </div>

            <button
              className="location-current-btn"
              onClick={handleUseCurrentLocation}
              id="use-current-location"
            >
              <span className="current-icon">◎</span>
              <div>
                <span className="current-text">Use current location</span>
                <span className="current-sub">Using device GPS</span>
              </div>
            </button>

            {!search && recentLocations.length > 0 && (
              <div className="location-section">
                <h4 className="location-section-title">Recent locations</h4>
                {recentLocations.map((loc) => (
                  <button
                    key={loc.name}
                    className="location-item"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <span className="location-item-icon">🕑</span>
                    <div className="location-item-info">
                      <span className="location-item-name">{loc.name}</span>
                      <span className="location-item-city">{loc.city}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="location-section">
              <h4 className="location-section-title">
                {search ? `Results for "${search}"` : 'All areas'}
              </h4>
              <div className="location-list">
                {filteredLocations.length === 0 ? (
                  <p className="location-empty">No locations found. Try a different search.</p>
                ) : (
                  filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      className="location-item"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      <span className="location-item-icon">📍</span>
                      <div className="location-item-info">
                        <span className="location-item-name">{loc.name}</span>
                        <span className="location-item-city">{loc.city}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
