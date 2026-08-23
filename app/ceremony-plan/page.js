'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCeremony } from '../context/CeremonyContext';
import { useAuth } from '../hooks/useAuth';
import './page.css';

export default function CeremonyPlanPage() {
  const { 
    location,
    ceremonyType,
    date,
    language,
    guestCount,
    selectedVenue, 
    selectedPriest, 
    selectedTemple,
    removeFromCeremony
  } = useCeremony();

  const { user, profile } = useAuth();

  // Booking & Payment State
  const [bookingHold, setBookingHold] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentState, setPaymentState] = useState('IDLE'); // 'IDLE' | 'CREATING_HOLD' | 'REVIEW' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const isComplete = selectedVenue || selectedPriest;

  // Step 1: Create Booking Hold
  const handleProceedToRequest = async () => {
    setPaymentState('CREATING_HOLD');
    setErrorMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'user_guest',
          ceremonyType: ceremonyType || 'Ceremony',
          date: date || 'Selected Date',
          location,
          guestCount,
          selectedPriest,
          selectedVenue,
          selectedTemple,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking hold.');
      }

      setBookingHold(data.booking);
      setPaymentState('REVIEW');
    } catch (err) {
      console.error('Booking Hold Error:', err);
      setErrorMessage(err.message || 'Failed to initialize booking.');
      setPaymentState('FAILED');
    }
  };

  // Direct Confirmation (Skip Gateway / Pay at Venue)
  const handleDirectConfirm = async () => {
    setPaymentState('CREATING_HOLD');
    setErrorMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'user_guest',
          ceremonyType: ceremonyType || 'Ceremony',
          date: date || 'Selected Date',
          location,
          guestCount,
          selectedPriest,
          selectedVenue,
          selectedTemple,
          paymentMethod: 'PAY_AT_VENUE',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to confirm booking.');
      }

      setBookingHold(data.booking);
      setVerificationResult({
        receiptReference: `REC_DIRECT_${Date.now().toString().slice(-6)}`,
        transactionId: `TXN_VENUE_${Date.now()}`,
        amount: data.booking.totalAmount,
        status: 'CONFIRMED (Pay at Venue)',
      });
      setPaymentState('SUCCESS');
    } catch (err) {
      console.error('Direct Booking Error:', err);
      setErrorMessage(err.message || 'Failed to complete direct booking.');
      setPaymentState('FAILED');
    }
  };

  // Step 2: Initiate Payment Order & Process Payment Server-Side
  const handlePayNow = async () => {
    if (!bookingHold) return;
    setPaymentState('PROCESSING');
    setErrorMessage('');

    try {
      // 1. Create Payment Order with Idempotency Key
      const idempotencyKey = `idemp_${bookingHold.bookingId}_${Date.now()}`;
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingHold.bookingId,
          amount: bookingHold.totalAmount,
          currency: 'INR',
          idempotencyKey,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Could not initiate payment order.');
      }

      setPaymentOrder(orderData.order);

      // Simulate Gateway Processing Delay (1.2s)
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Server-side Payment Verification
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.orderId,
          transactionId: `txn_${Date.now()}`,
          signature: 'valid_secure_sandbox_sig_adhyatmago',
          amount: bookingHold.totalAmount,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Server-side payment verification failed.');
      }

      setVerificationResult(verifyData.verification);
      setPaymentState('SUCCESS');
    } catch (err) {
      console.error('Payment Processing Error:', err);
      setErrorMessage(err.message || 'Payment transaction failed. Please retry.');
      setPaymentState('FAILED');
    }
  };

  return (
    <div className="plan-page">
      <div className="container plan-container">
        <div className="plan-header">
          <Link href="/ceremony-services" className="back-link">← Back to Services</Link>
          <h1 className="page-title">Your Ceremony Plan</h1>
          <p className="page-subtitle">Review your selected services, verify availability, and proceed to booking.</p>
        </div>

        <div className="plan-grid">
          {/* Left Column: Plan Details */}
          <div className="plan-details">
            <section className="plan-section">
              <div className="section-header">
                <h2>1. Event Context</h2>
                <Link href="/ceremony-services" className="btn-ghost btn-sm">Edit</Link>
              </div>
              <div className="context-card card">
                <div className="context-grid">
                  <div className="context-item">
                    <span className="context-label">Event</span>
                    <strong className="context-value">{ceremonyType || 'Griha Pravesham (Housewarming)'}</strong>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Location</span>
                    <strong className="context-value">{location.name}</strong>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Date</span>
                    <strong className="context-value">{date || 'Upcoming Sunday'}</strong>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Guests</span>
                    <strong className="context-value">{guestCount ? `Up to ${guestCount}` : 'Family & Guests'}</strong>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Language</span>
                    <strong className="context-value">{language || 'Telugu / Sanskrit'}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="plan-section">
              <div className="section-header">
                <h2>2. Selected Services</h2>
              </div>
              
              <div className="selected-services">
                {/* Venue */}
                <div className={`service-row ${!selectedVenue ? 'service-empty' : ''}`}>
                  <div className="service-icon">🏛️</div>
                  <div className="service-info">
                    <h4 className="service-type">Venue</h4>
                    {selectedVenue ? (
                      <>
                        <div className="service-name">{selectedVenue.name}</div>
                        <div className="service-meta">{selectedVenue.location} • {selectedVenue.priceLabel}</div>
                      </>
                    ) : (
                      <div className="service-missing">No venue selected</div>
                    )}
                  </div>
                  <div className="service-actions">
                    {selectedVenue ? (
                      <>
                        <Link href="/ceremony-services?category=venues" className="btn-ghost btn-sm">Change</Link>
                        <button className="btn-icon btn-ghost" onClick={() => removeFromCeremony(selectedVenue)}>✕</button>
                      </>
                    ) : (
                      <Link href="/ceremony-services?category=venues" className="btn btn-secondary btn-sm">Find Venue</Link>
                    )}
                  </div>
                </div>

                {/* Priest */}
                <div className={`service-row ${!selectedPriest ? 'service-empty' : ''}`}>
                  <div className="service-icon">🧑</div>
                  <div className="service-info">
                    <h4 className="service-type">Priest</h4>
                    {selectedPriest ? (
                      <>
                        <div className="service-name">{selectedPriest.name}</div>
                        <div className="service-meta">{selectedPriest.specialization[0]} • {selectedPriest.priceLabel}</div>
                      </>
                    ) : (
                      <div className="service-missing">No priest selected</div>
                    )}
                  </div>
                  <div className="service-actions">
                    {selectedPriest ? (
                      <>
                        <Link href="/ceremony-services?category=priests" className="btn-ghost btn-sm">Change</Link>
                        <button className="btn-icon btn-ghost" onClick={() => removeFromCeremony(selectedPriest)}>✕</button>
                      </>
                    ) : (
                      <Link href="/ceremony-services?category=priests" className="btn btn-secondary btn-sm">Find Priest</Link>
                    )}
                  </div>
                </div>

                {/* Temple */}
                <div className={`service-row ${!selectedTemple ? 'service-empty' : ''}`}>
                  <div className="service-icon">🛕</div>
                  <div className="service-info">
                    <h4 className="service-type">Temple <span className="badge">Optional</span></h4>
                    {selectedTemple ? (
                      <>
                        <div className="service-name">{selectedTemple.name}</div>
                        <div className="service-meta">{selectedTemple.location}</div>
                      </>
                    ) : (
                      <div className="service-missing">No temple selected</div>
                    )}
                  </div>
                  <div className="service-actions">
                    {selectedTemple ? (
                      <>
                        <Link href="/ceremony-services?category=temples" className="btn-ghost btn-sm">Change</Link>
                        <button className="btn-icon btn-ghost" onClick={() => removeFromCeremony(selectedTemple)}>✕</button>
                      </>
                    ) : (
                      <Link href="/ceremony-services?category=temples" className="btn btn-ghost btn-sm">Explore</Link>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Next Steps & Payment Flow */}
          <div className="plan-summary">
            <div className="summary-card card">
              <h3>Ceremony Booking Summary</h3>
              
              <ul className="checklist" style={{ marginBottom: 'var(--space-4)' }}>
                <li className={`check-item ${selectedVenue ? 'done' : ''}`}>
                  <span className="check-box"></span>
                  Select ceremony venue
                </li>
                <li className={`check-item ${selectedPriest ? 'done' : ''}`}>
                  <span className="check-box"></span>
                  Select verified priest
                </li>
                <li className={`check-item ${date ? 'done' : ''}`}>
                  <span className="check-box"></span>
                  Confirm date and timings
                </li>
                <li className={`check-item ${bookingHold ? 'done' : ''}`}>
                  <span className="check-box"></span>
                  Create 15-minute slot hold
                </li>
                <li className={`check-item ${paymentState === 'SUCCESS' ? 'done' : ''}`}>
                  <span className="check-box"></span>
                  Server-verified payment confirmation
                </li>
              </ul>

              <div className="divider"></div>

              {/* Payment Flow States */}
              {paymentState === 'IDLE' && (
                <div>
                  <div className="summary-alert" style={{ marginBottom: 'var(--space-4)' }}>
                    <strong>Availability Lock:</strong> Proceeding creates a trusted 15-minute hold on selected pandit and venue schedules.
                  </div>

                  <button 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%', marginBottom: '10px' }}
                    onClick={handleDirectConfirm}
                    disabled={!isComplete}
                    id="direct-confirm-btn"
                  >
                    {isComplete ? '✨ Confirm Booking (Skip Gateway / Pay at Venue)' : 'Select Priest or Venue to Proceed'}
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%' }}
                    onClick={handleProceedToRequest}
                    disabled={!isComplete}
                    id="proceed-request-btn"
                  >
                    Pay Online Deposit via Gateway →
                  </button>
                </div>
              )}

              {paymentState === 'CREATING_HOLD' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="animate-spin" style={{ fontSize: '24px', marginBottom: '8px' }}>☸️</div>
                  <p style={{ fontSize: '13px' }}>Verifying slot availability & creating hold...</p>
                </div>
              )}

              {paymentState === 'REVIEW' && bookingHold && (
                <div className="animate-fade-in">
                  <div style={{ background: 'var(--color-cream)', padding: '14px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--color-saffron-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>Hold ID:</span>
                      <strong style={{ fontSize: '12px' }}>{bookingHold.bookingId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>Deposit Amount:</span>
                      <strong style={{ fontSize: '16px', color: 'var(--color-saffron-dark)' }}>
                        ₹{bookingHold.totalAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-sage-dark)' }}>
                      ⏱️ Slot held for 15 minutes
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handlePayNow}
                    id="pay-now-btn"
                  >
                    🔒 Pay Now (₹{bookingHold.totalAmount.toLocaleString('en-IN')})
                  </button>
                </div>
              )}

              {paymentState === 'PROCESSING' && (
                <div style={{ textAlign: 'center', padding: '24px 0' }} className="animate-fade-in">
                  <div className="animate-spin" style={{ fontSize: '28px', marginBottom: '10px' }}>💳</div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Processing Payment...</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    Communicating with payment gateway and verifying signature server-side.
                  </p>
                </div>
              )}

              {paymentState === 'SUCCESS' && verificationResult && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎉</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-sage-dark)', margin: '0 0 6px' }}>
                    Booking Confirmed!
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '16px' }}>
                    Your ceremony booking is locked and verified.
                  </p>

                  <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '12px', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '4px' }}><strong>Receipt Ref:</strong> {verificationResult.receiptReference}</div>
                    <div style={{ marginBottom: '4px' }}><strong>Transaction ID:</strong> {verificationResult.transactionId}</div>
                    <div style={{ marginBottom: '4px' }}><strong>Amount Paid:</strong> ₹{verificationResult.amount.toLocaleString('en-IN')}</div>
                    <div><strong>Status:</strong> <span style={{ color: 'var(--color-sage-dark)', fontWeight: 700 }}>VERIFIED</span></div>
                  </div>

                  <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    View in Dashboard →
                  </Link>
                </div>
              )}

              {paymentState === 'FAILED' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚠️</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626', margin: '0 0 6px' }}>
                    Transaction Failed
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', marginBottom: '14px' }}>
                    {errorMessage || 'Payment could not be completed.'}
                  </p>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    onClick={handleProceedToRequest}
                  >
                    Retry Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
