// scripts/verify-integration.mjs
const BASE = 'http://localhost:3000';

async function testRoute(name, url, method = 'GET', body = null) {
  try {
    const opts = { method, headers: {} };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${url}`, opts);
    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { length: text.length, preview: text.slice(0, 120).replace(/\n/g, ' ') };
    }
    console.log(`✓ [${res.status}] ${name} (${url})`);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`✗ [FAIL] ${name} (${url}):`, err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log('\n--- 1. Testing Next.js Frontend Pages ---');
  await testRoute('Home Page', '/');
  await testRoute('Ceremony Services Hub', '/ceremony-services');
  await testRoute('Priests Category Filter', '/ceremony-services?category=priests');
  await testRoute('Temples Category Filter', '/ceremony-services?category=temples');
  await testRoute('Venues Category Filter', '/ceremony-services?category=venues');
  await testRoute('AI Assistant Page', '/ai');
  await testRoute('Auth Login Page', '/login');
  await testRoute('Profile Onboarding Page', '/onboarding');
  await testRoute('Devotee Dashboard', '/dashboard');
  await testRoute('Ceremony Plan Review', '/ceremony-plan');
  await testRoute('Priest Detail Page', '/priest/p1');
  await testRoute('Temple Detail Page', '/temple/t1');
  await testRoute('Venue Detail Page', '/venue/v1');

  console.log('\n--- 2. Testing Backend API Routes ---');
  await testRoute('AI Chat Controller (START)', '/api/ai/chat', 'POST', {
    query: 'I want to plan a Griha Pravesham next Sunday in Hyderabad with a Telugu priest',
    history: [],
  });

  await testRoute('Recommendation Engine', '/api/recommendations', 'POST', {
    ceremonyType: 'Griha Pravesham',
    location: 'Hyderabad',
    language: 'Telugu',
  });

  await testRoute('Nearby Temples Geolocation', '/api/nearby-temples', 'POST', {
    lat: 17.4401,
    lng: 78.3489,
    maxDistanceKm: 15,
  });

  await testRoute('Booking Hold Creation', '/api/bookings', 'POST', {
    userId: 'test_devotee_123',
    ceremonyType: 'Griha Pravesham',
    date: '2026-09-15',
    location: 'Gachibowli, Hyderabad',
    selectedPriest: { id: 'p1', name: 'Pandit Sharma', price: 5100 },
  });

  await testRoute('Payment Order Creation', '/api/payments/create-order', 'POST', {
    bookingId: 'book_demo_123',
    amount: 5100,
  });

  console.log('\nAll integration checks finished!\n');
}

run();
