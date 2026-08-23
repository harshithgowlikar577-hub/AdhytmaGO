import { NextResponse } from 'next/server';
import { createPaymentOrder } from '../../../lib/paymentService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, amount, currency, idempotencyKey } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });
    }

    const order = await createPaymentOrder({
      bookingId,
      amount: amount || 5000,
      currency: currency || 'INR',
      idempotencyKey: idempotencyKey || null,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Create Payment Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
