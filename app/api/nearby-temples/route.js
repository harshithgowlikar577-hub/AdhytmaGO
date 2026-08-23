import { NextResponse } from 'next/server';
import { temples } from '../../data/mockData';

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const latitude = body.latitude !== undefined ? body.latitude : body.lat;
    const longitude = body.longitude !== undefined ? body.longitude : body.lng;
    const radius = body.radius !== undefined ? body.radius : (body.maxDistanceKm || 10);

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Latitude and Longitude required.' }, { status: 400 });
    }

    const calculatedTemples = temples.map(t => {
      const distance = calculateHaversineDistance(latitude, longitude, t.lat, t.lng);
      return {
        id: t.id,
        name: t.name,
        image: t.image,
        location: t.location,
        area: t.area,
        distance,
        services: t.services,
        timings: t.timings,
        accessibility: t.accessibility,
        availability: t.availability,
        rating: t.rating,
        reviewCount: t.reviewCount,
        description: t.description,
      };
    })
    .filter(t => t.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      count: calculatedTemples.length,
      results: calculatedTemples,
    });
  } catch (error) {
    console.error('Nearby Temples Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
