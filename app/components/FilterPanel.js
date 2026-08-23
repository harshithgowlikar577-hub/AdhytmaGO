'use client';

import { useState, useEffect } from 'react';
import { useCeremony } from '../context/CeremonyContext';
import { facilityOptions, languageOptions, ceremonyTypes } from '../data/mockData';
import './FilterPanel.css';

export default function FilterPanel() {
  const { 
    selectedCategory, 
    isFilterOpen, 
    toggleFilter, 
    setDate, 
    setCeremonyType, 
    setLanguage, 
    setGuestCount, 
    setBudget,
    filters,
    setFilters,
    clearFilters
  } = useCeremony();

  const [selectedFacilities, setSelectedFacilities] = useState(filters?.facilities || []);
  const [selectedLanguages, setSelectedLanguages] = useState(filters?.languages || []);
  const [selectedTempleServices, setSelectedTempleServices] = useState(filters?.templeServices || []);
  const [priceFilter, setPriceFilter] = useState(filters?.price || '');
  const [availabilityFilter, setAvailabilityFilter] = useState(filters?.availability || 'all');
  const [capacityFilter, setCapacityFilter] = useState(filters?.capacity || '');
  const [ratingFilter, setRatingFilter] = useState(filters?.rating || '');
  const [dateFilter, setDateFilter] = useState('');

  // Sync state to CeremonyContext so results update automatically
  useEffect(() => {
    setFilters({
      price: priceFilter,
      capacity: capacityFilter,
      facilities: selectedFacilities,
      languages: selectedLanguages,
      availability: availabilityFilter,
      rating: ratingFilter,
      templeServices: selectedTempleServices,
    });
  }, [priceFilter, capacityFilter, selectedFacilities, selectedLanguages, availabilityFilter, ratingFilter, selectedTempleServices, setFilters]);

  const toggleFacility = (f) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const toggleLang = (l) => {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const toggleTempleService = (s) => {
    setSelectedTempleServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleRating = (r) => {
    setRatingFilter((prev) => (prev === r ? '' : r));
  };

  const handleClearAll = () => {
    setSelectedFacilities([]);
    setSelectedLanguages([]);
    setSelectedTempleServices([]);
    setPriceFilter('');
    setAvailabilityFilter('all');
    setCapacityFilter('');
    setRatingFilter('');
    setDateFilter('');
    setGuestCount('');
    setBudget('');
    setLanguage('');
    clearFilters();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isFilterOpen && <div className="filter-backdrop" onClick={toggleFilter} />}

      <aside className={`filter-panel ${isFilterOpen ? 'filter-panel-open' : ''}`} id="filter-panel">
        <div className="filter-panel-header">
          <h3>Filters</h3>
          <button className="filter-close" onClick={toggleFilter}>✕</button>
        </div>

        <div className="filter-scroll">
          {/* Date */}
          <div className="filter-section">
            <h4 className="filter-title">Date</h4>
            <input
              type="date"
              className="input-field filter-date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setDate(e.target.value); }}
              id="filter-date"
            />
          </div>

          {/* Ceremony Type */}
          <div className="filter-section">
            <h4 className="filter-title">Ceremony Type</h4>
            <select
              className="select-field filter-select"
              onChange={(e) => setCeremonyType(e.target.value)}
              id="filter-ceremony-type"
            >
              <option value="">All ceremonies</option>
              {ceremonyTypes.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>

          {/* Venues-specific filters */}
          {selectedCategory === 'venues' && (
            <>
              <div className="filter-section">
                <h4 className="filter-title">Guest Capacity</h4>
                <div className="filter-chips">
                  {['50', '100', '250', '500+'].map((cap) => (
                    <button
                      key={cap}
                      className={`filter-chip ${capacityFilter === cap ? 'filter-chip-active' : ''}`}
                      onClick={() => {
                        const val = cap === capacityFilter ? '' : cap;
                        setCapacityFilter(val);
                        setGuestCount(val);
                      }}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Price Range</h4>
                <div className="filter-chips">
                  {['₹', '₹₹', '₹₹₹'].map((p) => (
                    <button
                      key={p}
                      className={`filter-chip ${priceFilter === p ? 'filter-chip-active' : ''}`}
                      onClick={() => {
                        const val = p === priceFilter ? '' : p;
                        setPriceFilter(val);
                        setBudget(val);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Facilities</h4>
                <div className="filter-checkboxes">
                  {facilityOptions.map((f) => (
                    <label key={f} className="checkbox-custom">
                      <input
                        type="checkbox"
                        checked={selectedFacilities.includes(f)}
                        onChange={() => toggleFacility(f)}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Priests-specific filters */}
          {selectedCategory === 'priests' && (
            <>
              <div className="filter-section">
                <h4 className="filter-title">Language</h4>
                <div className="filter-checkboxes">
                  {languageOptions.map((l) => (
                    <label key={l} className="checkbox-custom">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(l)}
                        onChange={() => { toggleLang(l); setLanguage(l); }}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Price Range</h4>
                <div className="filter-chips">
                  {['₹', '₹₹', '₹₹₹'].map((p) => (
                    <button
                      key={p}
                      className={`filter-chip ${priceFilter === p ? 'filter-chip-active' : ''}`}
                      onClick={() => setPriceFilter(p === priceFilter ? '' : p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Verification</h4>
                <div className="filter-chips">
                  <button
                    className={`filter-chip ${availabilityFilter === 'verified' ? 'filter-chip-active' : ''}`}
                    onClick={() => setAvailabilityFilter(availabilityFilter === 'verified' ? 'all' : 'verified')}
                  >
                    ✓ Verified Only
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Temples-specific filters */}
          {selectedCategory === 'temples' && (
            <div className="filter-section">
              <h4 className="filter-title">Services</h4>
              <div className="filter-checkboxes">
                {['Daily Pooja', 'Archana', 'Abhishekam', 'Special Homams', 'Kalyanam'].map((s) => (
                  <label key={s} className="checkbox-custom">
                    <input 
                      type="checkbox" 
                      checked={selectedTempleServices.includes(s)}
                      onChange={() => toggleTempleService(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="filter-section">
            <h4 className="filter-title">Availability</h4>
            <div className="filter-chips">
              <button
                className={`filter-chip ${availabilityFilter === 'available' ? 'filter-chip-active' : ''}`}
                onClick={() => setAvailabilityFilter(availabilityFilter === 'available' ? 'all' : 'available')}
              >
                Available
              </button>
              <button
                className={`filter-chip ${availabilityFilter === 'request' ? 'filter-chip-active' : ''}`}
                onClick={() => setAvailabilityFilter(availabilityFilter === 'request' ? 'all' : 'request')}
              >
                Request Only
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-section">
            <h4 className="filter-title">Rating</h4>
            <div className="filter-chips">
              {['4+', '4.5+'].map((r) => (
                <button 
                  key={r} 
                  className={`filter-chip ${ratingFilter === r ? 'filter-chip-active' : ''}`}
                  onClick={() => toggleRating(r)}
                >
                  {r} ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-ghost" onClick={handleClearAll}>
            Clear All
          </button>
          <button className="btn btn-primary" onClick={toggleFilter}>
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
