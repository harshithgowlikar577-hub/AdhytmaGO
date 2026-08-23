import { NextResponse } from 'next/server';
import { verifyPayment } from '../../../lib/paymentService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, transactionId, signature, amount } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const verificationResult = await verifyPayment({
      orderId,
      transactionId: transactionId || `txn_${Date.now()}`,
      signature: signature || 'valid_sandbox_sig_adhyatmago_2026',
      amount,
    });

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        verification: verificationResult,
        message: 'Payment verified successfully by server. Booking confirmed.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.message || 'Payment verification failed.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
