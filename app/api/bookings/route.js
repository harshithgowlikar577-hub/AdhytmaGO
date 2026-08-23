import { NextResponse } from 'next/server';

// Server-side booking hold store
const bookingHolds = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ceremonyType, date, location, guestCount, selectedPriest, selectedVenue, selectedTemple } = body;

    if (!ceremonyType && !selectedPriest && !selectedVenue) {
      return NextResponse.json({ error: 'At least one service or ceremony is required.' }, { status: 400 });
    }

    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Calculate trusted payable amount server-side
    let calculatedAmount = 0;
    if (selectedPriest) {
      // Estimate base booking deposit / dakshina
      calculatedAmount += 5000;
    }
    if (selectedVenue) {
      // Estimate venue advance / hold deposit
      calculatedAmount += 15000;
    }
    if (selectedTemple) {
      calculatedAmount += 1000;
    }
    if (calculatedAmount === 0) {
      calculatedAmount = 2500; // Base ceremony coordination deposit
    }

    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minute hold

    const holdData = {
      bookingId,
      userId: userId || 'anonymous_user',
      ceremonyType: ceremonyType || 'Ceremony',
      date: date || 'Upcoming',
      location: location?.name || 'Hyderabad',
      guestCount: guestCount || 'Standard',
      selectedPriest: selectedPriest ? { id: selectedPriest.id, name: selectedPriest.name } : null,
      selectedVenue: selectedVenue ? { id: selectedVenue.id, name: selectedVenue.name } : null,
      selectedTemple: selectedTemple ? { id: selectedTemple.id, name: selectedTemple.name } : null,
      totalAmount: calculatedAmount,
      currency: 'INR',
      status: 'HOLD',
      holdExpiresAt,
      createdAt: new Date().toISOString(),
    };

    bookingHolds.set(bookingId, holdData);

    return NextResponse.json({
      success: true,
      booking: holdData,
      message: 'Booking hold created successfully. Slot reserved for 15 minutes.',
    });
  } catch (error) {
    console.error('Bookings API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('id');

  if (bookingId && bookingHolds.has(bookingId)) {
    return NextResponse.json({ success: true, booking: bookingHolds.get(bookingId) });
  }

  return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
}
