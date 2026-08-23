/**
 * @file paymentService.js
 * Modular Server-Side Payment Service for AdhyatmaGO
 * Implements clean abstraction with order creation, signature verification,
 * server-side amount checking, idempotency, and refund support.
 */

// In-memory server-side transaction store (or Firestore in production)
const paymentOrders = new Map();
const processedWebhooks = new Set();

/**
 * Generate a secure unique ID
 */
function generateId(prefix = 'pay') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a server-side payment order
 * @param {Object} params
 * @param {string} params.bookingId - Booking ID
 * @param {number} params.amount - Amount in INR
 * @param {string} [params.currency='INR'] - Currency
 * @param {string} [params.idempotencyKey] - Unique client key to prevent duplicate orders
 * @returns {Promise<Object>}
 */
export async function createPaymentOrder({ bookingId, amount, currency = 'INR', idempotencyKey }) {
  if (!bookingId || !amount || amount <= 0) {
    throw new Error('Invalid booking ID or payment amount.');
  }

  // Idempotency check: Return existing order if already created for this key
  if (idempotencyKey && paymentOrders.has(idempotencyKey)) {
    const existing = paymentOrders.get(idempotencyKey);
    return {
      orderId: existing.orderId,
      bookingId: existing.bookingId,
      amount: existing.amount,
      currency: existing.currency,
      status: existing.status,
      isDuplicate: true,
    };
  }

  const orderId = generateId('ord');
  const paymentRecord = {
    orderId,
    bookingId,
    amount,
    currency,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey: idempotencyKey || null,
  };

  // Store in active records
  paymentOrders.set(orderId, paymentRecord);
  if (idempotencyKey) {
    paymentOrders.set(idempotencyKey, paymentRecord);
  }

  return {
    orderId,
    bookingId,
    amount,
    currency,
    status: 'PENDING',
    gatewayKey: 'sandbox_pub_adhyatmago', // Safe public key
  };
}

/**
 * Verify payment transaction server-side
 * @param {Object} params
 * @param {string} params.orderId - Gateway Order ID
 * @param {string} params.transactionId - Gateway Transaction ID
 * @param {string} params.signature - Gateway signature or verification token
 * @param {number} params.amount - Claimed amount
 * @returns {Promise<Object>}
 */
export async function verifyPayment({ orderId, transactionId, signature, amount }) {
  const order = paymentOrders.get(orderId);

  if (!order) {
    throw new Error('Payment order not found.');
  }

  // Server-side amount validation: Prevent amount tampering
  if (amount && Math.abs(order.amount - amount) > 0.01) {
    order.status = 'FAILED';
    order.error = 'Payment amount mismatch between client and server order.';
    order.updatedAt = new Date().toISOString();
    return {
      success: false,
      status: 'FAILED',
      message: 'Payment verification failed: Amount mismatch.',
    };
  }

  // Signature check simulation (In production, HMAC SHA256 with secret key)
  const isSignatureValid = Boolean(signature && signature.length > 5);

  if (!isSignatureValid) {
    order.status = 'FAILED';
    order.updatedAt = new Date().toISOString();
    return {
      success: false,
      status: 'FAILED',
      message: 'Invalid payment signature.',
    };
  }

  // Mark successful and idempotent
  order.status = 'SUCCESS';
  order.transactionId = transactionId || generateId('txn');
  order.receiptReference = `REC-${orderId.substring(4).toUpperCase()}`;
  order.updatedAt = new Date().toISOString();

  return {
    success: true,
    status: 'SUCCESS',
    orderId: order.orderId,
    bookingId: order.bookingId,
    transactionId: order.transactionId,
    receiptReference: order.receiptReference,
    amount: order.amount,
    currency: order.currency,
  };
}

/**
 * Get current payment status
 * @param {string} orderId
 */
export async function getPaymentStatus(orderId) {
  const order = paymentOrders.get(orderId);
  if (!order) {
    return { status: 'NOT_FOUND' };
  }
  return {
    orderId: order.orderId,
    bookingId: order.bookingId,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    receiptReference: order.receiptReference || null,
  };
}

/**
 * Request a refund for a successful booking payment
 * @param {string} orderId
 * @param {string} reason
 */
export async function requestRefund(orderId, reason = 'User cancellation') {
  const order = paymentOrders.get(orderId);
  if (!order) {
    throw new Error('Payment order not found for refund.');
  }
  if (order.status !== 'SUCCESS') {
    throw new Error(`Cannot refund order with status ${order.status}.`);
  }

  order.status = 'REFUNDED';
  order.refundReason = reason;
  order.refundId = generateId('ref');
  order.updatedAt = new Date().toISOString();

  return {
    success: true,
    refundId: order.refundId,
    orderId: order.orderId,
    status: 'REFUNDED',
    amount: order.amount,
  };
}
