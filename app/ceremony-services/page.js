'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCeremony } from '../context/CeremonyContext';
import LocationSelector from '../components/LocationSelector';
import ServiceCategoryTabs from '../components/ServiceCategoryTabs';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import VenueCard from '../components/VenueCard';
import PriestCard from '../components/PriestCard';
import TempleCard from '../components/TempleCard';
import NearbyServices from '../components/NearbyServices';
import AIPlanner from '../components/AIPlanner';
import MobileBottomNav from '../components/MobileBottomNav';
import SortDropdown from '../components/SortDropdown';
import { venues, priests, temples } from '../data/mockData';
import './page.css';

function CeremonyServicesContent() {
  const searchParams = useSearchParams();
  const { selectedCategory, setCategory, searchRadius, sortBy, filters, isMapExpanded } = useCeremony();

  // Set category from URL query param on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['venues', 'priests', 'temples'].includes(cat)) {
      setCategory(cat);
    }
  }, [searchParams, setCategory]);

  // Determine which data to show based on selected category
  let results = [];
  if (selectedCategory === 'venues') results = venues;
  else if (selectedCategory === 'priests') results = priests;
  else if (selectedCategory === 'temples') results = temples;

  // Filter based on search radius
  results = results.filter(item => item.distance <= searchRadius);

  // Filter based on price range
  if (filters?.price) {
    results = results.filter(item => item.priceRange === filters.price);
  }

  // Filter based on availability / verification
  if (filters?.availability === 'verified') {
    results = results.filter(item => item.verified);
  } else if (filters?.availability === 'available') {
    results = results.filter(item => item.availability === 'available');
  } else if (filters?.availability === 'request') {
    results = results.filter(item => item.availability === 'request');
  }

  // Filter based on rating
  if (filters?.rating === '4+') {
    results = results.filter(item => item.rating >= 4.0);
  } else if (filters?.rating === '4.5+') {
    results = results.filter(item => item.rating >= 4.5);
  }

  // Category specific filters
  if (selectedCategory === 'venues') {
    if (filters?.capacity) {
      const minCap = parseInt(filters.capacity, 10);
      if (!isNaN(minCap)) {
        results = results.filter(item => (item.capacity || 0) >= minCap);
      }
    }
    if (filters?.facilities && filters.facilities.length > 0) {
      results = results.filter(item => 
        filters.facilities.every(f => item.facilities?.includes(f))
      );
    }
  } else if (selectedCategory === 'priests') {
    if (filters?.languages && filters.languages.length > 0) {
      results = results.filter(item => 
        filters.languages.some(l => item.languages?.includes(l))
      );
    }
  } else if (selectedCategory === 'temples') {
    if (filters?.templeServices && filters.templeServices.length > 0) {
      results = results.filter(item => 
        filters.templeServices.some(s => item.services?.includes(s))
      );
    }
  }

  // Apply sorting
  results = [...results].sort((a, b) => {
    if (sortBy === 'nearest') return a.distance - b.distance;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'availability') return (a.availability === 'available' ? -1 : 1);
    if (sortBy === 'price_asc') {
      const pA = a.priceRange === '₹' ? 1 : a.priceRange === '₹₹' ? 2 : 3;
      const pB = b.priceRange === '₹' ? 1 : b.priceRange === '₹₹' ? 2 : 3;
      return pA - pB;
    }
    // recommended: verified first, then highest rating
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return b.rating - a.rating;
  });

  const getCategoryTitle = () => {
    if (selectedCategory === 'venues') return 'Function Halls Near You';
    if (selectedCategory === 'priests') return 'Priests Near You';
    if (selectedCategory === 'temples') return 'Temples Near You';
  };

  const getCategorySubtitle = () => {
    if (selectedCategory === 'venues') return 'Find ceremony venues based on location, capacity, facilities, price and availability.';
    if (selectedCategory === 'priests') return 'Verified priests available for your specific ceremony needs and language.';
    if (selectedCategory === 'temples') return 'Explore nearby temples, services, timings and available slots.';
  };

  return (
    <div className="services-page">
      <div className="container">
        
        {/* Top Section */}
        <div className="services-header-section">
          <div className="services-title-area">
            <h1 className="page-title">Plan Your Ceremony Around You</h1>
            <p className="page-subtitle">Everything you need for your ceremony, around you.</p>
          </div>
          
          <div className="location-wrapper">
            <LocationSelector />
          </div>
        </div>

        <AIPlanner />

        <div className="tabs-wrapper">
          <ServiceCategoryTabs />
        </div>

        {/* Main 3-Column Layout */}
        <div className="services-layout">
          
          {/* Left: Filters */}
          <div className="layout-sidebar">
            <FilterPanel />
          </div>
          
          {/* Center: Results */}
          <div className={`layout-content ${isMapExpanded ? 'hidden-on-mobile' : ''}`}>
            <div className="results-header">
              <div>
                <h2 className="results-title">{getCategoryTitle()}</h2>
                <p className="results-subtitle">{getCategorySubtitle()}</p>
                <div className="results-count">Showing {results.length} results within {searchRadius} km</div>
              </div>
              
              <div className="results-controls">
                <SortDropdown />
              </div>
            </div>
            
            <div className="results-grid">
              {results.length === 0 ? (
                <div className="no-results">
                  <h3>No results found</h3>
                  <p>Try increasing your search radius or changing filters.</p>
                </div>
              ) : (
                results.map(item => (
                  <div key={item.id}>
                    {selectedCategory === 'venues' && <VenueCard venue={item} />}
                    {selectedCategory === 'priests' && <PriestCard priest={item} />}
                    {selectedCategory === 'temples' && <TempleCard temple={item} />}
                  </div>
                ))
              )}
            </div>

            <NearbyServices />
          </div>
          
          {/* Right: Map */}
          <div className={`layout-map ${!isMapExpanded ? 'hidden-on-mobile' : ''}`}>
            <div className="sticky-map-wrapper">
              <MapView items={results} />
            </div>
          </div>
          
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

export default function CeremonyServicesPage() {
  return (
    <Suspense fallback={<div className="services-page"><div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Loading sacred services...</div></div>}>
      <CeremonyServicesContent />
    </Suspense>
  );
}

