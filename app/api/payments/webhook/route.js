import { NextResponse } from 'next/server';
import { verifyPayment } from '../../../lib/paymentService';

const processedWebhookEvents = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    const eventId = body.eventId || `evt_${body.orderId}_${body.status}`;

    // Idempotent webhook processing: prevent processing same event twice
    if (processedWebhookEvents.has(eventId)) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    const { orderId, transactionId, signature, amount, status } = body;

    if (status === 'SUCCESS' && orderId) {
      await verifyPayment({
        orderId,
        transactionId: transactionId || 'webhook_txn',
        signature: signature || 'valid_webhook_sig',
        amount,
      });
    }

    processedWebhookEvents.add(eventId);

    return NextResponse.json({ received: true, status: 'PROCESSED' });
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ received: false, error: error.message }, { status: 500 });
  }
}
