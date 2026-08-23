'use client';

import { useEffect, useRef, useState } from 'react';
import { useCeremony } from '../context/CeremonyContext';
import Link from 'next/link';
import './MapView.css';

export default function MapView({ items }) {
  const { location, selectedCategory } = useCeremony();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load Leaflet dynamically on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet CSS is already injected
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is loaded
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapContainerRef.current || !window.L) return;

      // Destroy existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = window.L;
      const centerLat = location.lat || 17.4401;
      const centerLng = location.lng || 78.3489;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom User Location Pin
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 38px;
            height: 38px;
            background: #D4A843;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              background: rgba(212,168,67,0.4);
              animation: pulseRing 2s infinite;
            "></div>
            📍
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      L.marker([centerLat, centerLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br/>${location.name}`);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location.lat, location.lng]);

  // Update Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Center map on location
    if (location.lat && location.lng) {
      map.setView([location.lat, location.lng], 13);
    }

    items.forEach(item => {
      if (!item.lat || !item.lng) return;

      let iconEmoji = '📍';
      let themeColor = '#D4A843';
      if (item.type === 'venue') { iconEmoji = '🏛️'; themeColor = '#C4704B'; }
      if (item.type === 'priest') { iconEmoji = '🧑'; themeColor = '#D4A843'; }
      if (item.type === 'temple') { iconEmoji = '🛕'; themeColor = '#7A9E7E'; }

      const customIcon = L.divIcon({
        className: 'custom-item-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: white;
            border: 2px solid ${themeColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s;
          ">
            ${iconEmoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const popupContent = `
        <div style="width: 180px; text-align: center; font-family: inherit;">
          ${item.image ? `<img src="${item.image}" style="width: 100%; height: 90px; object-fit: cover; object-position: center 15%; border-radius: 8px; margin-bottom: 8px;" />` : ''}
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1a1a2e;">${item.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">📍 ${item.location}</div>
          <div style="font-size: 12px; color: #d4a843; font-weight: 600; margin-bottom: 8px;">★ ${item.rating} • ${item.distance} km away</div>
          <a href="/${item.type}/${item.id}" style="
            display: inline-block;
            background: ${themeColor};
            color: white;
            text-decoration: none;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          ">View Details</a>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on('click', () => setSelectedItem(item));
      markersRef.current.push(marker);
    });
  }, [items, location]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && location.lat && location.lng) {
      mapInstanceRef.current.setView([location.lat, location.lng], 13);
    }
  };

  return (
    <div className="map-container" id="map-view">
      {/* Real Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', minHeight: '420px', zIndex: 1 }} 
      />

      {/* Backup High-Quality Map Graphic Layer if tiles are loading */}
      {!mapLoaded && (
        <div className="map-visual">
          <div className="map-fallback-graphic">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15, position: 'absolute', inset: 0 }}>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div style={{ position: 'absolute', top: '20%', left: '30%', color: 'var(--color-gray-400)', fontSize: '12px', fontWeight: 600 }}>Gachibowli</div>
            <div style={{ position: 'absolute', top: '15%', left: '60%', color: 'var(--color-gray-400)', fontSize: '12px', fontWeight: 600 }}>Kondapur</div>
            <div style={{ position: 'absolute', top: '45%', left: '40%', color: 'var(--color-gray-400)', fontSize: '12px', fontWeight: 600 }}>Madhapur</div>
            <div style={{ position: 'absolute', top: '65%', left: '70%', color: 'var(--color-gray-400)', fontSize: '12px', fontWeight: 600 }}>Jubilee Hills</div>
          </div>
        </div>
      )}

      {/* Floating Map Area Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '6px 14px',
        borderRadius: '20px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-gray-900)'
      }}>
        <span>📍</span> {location.name} Region ({items.length} locations)
      </div>

      {/* Map Control Buttons */}
      <div className="map-controls" style={{ zIndex: 1000 }}>
        <button onClick={handleZoomIn} className="btn btn-icon btn-secondary" title="Zoom In">＋</button>
        <button onClick={handleZoomOut} className="btn btn-icon btn-secondary" title="Zoom Out">－</button>
        <button onClick={handleRecenter} className="btn btn-icon btn-secondary" title="Re-center on location">◎</button>
      </div>

      {/* Selected Item Floating Card */}
      {selectedItem && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '70px',
          background: 'white',
          borderRadius: '14px',
          padding: '12px 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid var(--color-gray-200)',
          animation: 'slideUp 0.2s ease-out'
        }}>
          {selectedItem.image && (
            <img 
              src={selectedItem.image} 
              alt={selectedItem.name} 
              style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', objectPosition: 'center 15%' }} 
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedItem.name}</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-gray-500)' }}>📍 {selectedItem.location} • {selectedItem.distance} km</p>
          </div>
          <Link href={`/${selectedItem.type}/${selectedItem.id}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            View
          </Link>
          <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}>✕</button>
        </div>
      )}
    </div>
  );
}
