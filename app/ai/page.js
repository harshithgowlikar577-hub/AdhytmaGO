'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCeremony } from '../context/CeremonyContext';
import './page.css';

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { addToCeremony, setCeremonyType, setLocation, setDate, setGuestCount, language, toggleDrawer } = useCeremony();

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: language === 'Telugu'
        ? 'నమస్కారం 🙏 నేను మీ అధ్యాత్మGO వేద సహాయకుడిని. మీరు ఏ వేడుకను ప్లాన్ చేయాలనుకుంటున్నారో చెప్పండి — పురోహితులు, గుడులు, కల్యాణ మండపాలు, లేదా పూజ సామగ్రి లిస్ట్ — అన్నీ మీకు సహాయం చేస్తాను!'
        : 'Namaste! 🙏 I\'m your AdhyatmaGO ceremony assistant. Tell me what you\'re planning — I can help you find priests, temples, function halls, and prepare checklists for your ceremony.',
      intent: 'START',
      state: 'START',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [currentEntities, setCurrentEntities] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If initial query from home page query param
  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Sanitize history: only send sender + text to avoid bloating the request
      const sanitizedHistory = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          history: sanitizedHistory,
          currentIntent,
          currentEntities,
        }),
      });

      const data = await res.json();

      setCurrentIntent(data.intent);
      setCurrentEntities(data.entities || {});

      // Sync with CeremonyContext if entities present
      if (data.entities?.ceremony_type) setCeremonyType(data.entities.ceremony_type);
      if (data.entities?.date) setDate(data.entities.date);
      if (data.entities?.guest_count) setGuestCount(String(data.entities.guest_count));
      if (data.entities?.location) setLocation({ name: data.entities.location, area: data.entities.location });

      // If direct booking hold created, auto-add services to ceremony plan
      if (data.bookingHold) {
        if (data.bookingHold.selectedPriest) addToCeremony(data.bookingHold.selectedPriest);
        if (data.bookingHold.selectedVenue) addToCeremony(data.bookingHold.selectedVenue);
      }

      const assistantMessage = {
        sender: 'assistant',
        text: data.message,
        intent: data.intent,
        state: data.state,
        action: data.action,
        knownFields: data.known_fields || [],
        missingFields: data.missing_fields || [],
        recommendations: data.recommendations || [],
        bookingHold: data.bookingHold || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network');
      const errorMessage = isNetworkError
        ? "I'm having trouble connecting right now. Please check your internet connection and try again in a moment."
        : "I'm experiencing a temporary issue. Please try again in a moment, or browse services directly from the menu above.";

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: errorMessage,
          state: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSend(prompt);
  };

  const handleClearConversation = () => {
    setMessages([
      {
        sender: 'assistant',
        text: language === 'Telugu'
          ? 'నమస్కారం 🙏 కొత్త సంభాషణ ప్రారంభమైంది. మీకు ఏమి సహాయం కావాలి?'
          : 'Namaste! 🙏 Fresh start. What ceremony would you like to plan?',
        intent: 'START',
        state: 'START',
      },
    ]);
    setCurrentIntent(null);
    setCurrentEntities({});
    setInput('');
  };

  // Friendly entity display for sidebar
  const entityDisplay = [
    { label: '🎪 Ceremony', value: currentEntities.ceremony_type },
    { label: '📍 Location', value: currentEntities.location },
    { label: '📅 Date', value: currentEntities.date },
    { label: '🗣️ Language', value: currentEntities.language },
    { label: '👥 Guests', value: currentEntities.guest_count },
    { label: '💰 Budget', value: currentEntities.budget },
  ].filter(e => e.value);

  // Friendly intent label
  const intentLabels = {
    PRIEST_SEARCH: '🧑 Finding Priests',
    HALL_SEARCH: '🏛️ Finding Halls',
    TEMPLE_SEARCH: '🛕 Finding Temples',
    TEMPLE_POOJA: '🛕 Temple Pooja',
    NEARBY_TEMPLE: '📍 Nearby Temples',
    CEREMONY_PLANNING: '✨ Planning Ceremony',
    CHECKLIST: '📋 Preparation Checklist',
    RITUAL_GUIDANCE: '📖 Ritual Guidance',
    OUT_OF_SCOPE: '🔄 Redirecting',
  };

  return (
    <div className="ai-page">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span className="badge badge-verified" style={{ marginBottom: '8px' }}>
            ✨ AI-Powered Ceremony Planning
          </span>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, margin: '4px 0' }}>
            Plan with AI
          </h1>
          <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
            Tell me what ceremony you're planning — I'll guide you through finding the right priests, venues, and preparations.
          </p>
        </div>

        <div className="ai-chat-layout">
          {/* Sidebar with context & shortcuts */}
          <div className="ai-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                Your Plan
              </h3>
              <button
                onClick={handleClearConversation}
                className="btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--color-gray-500)' }}
                title="Start fresh"
              >
                🔄 Reset
              </button>
            </div>

            {/* Current status */}
            {currentIntent && (
              <div style={{ marginBottom: 'var(--space-4)', padding: '10px 12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: '2px' }}>
                  Currently
                </div>
                <strong style={{ color: 'var(--color-saffron-dark)', fontSize: '13px' }}>
                  {intentLabels[currentIntent] || '✨ Assisting You'}
                </strong>
              </div>
            )}

            {/* Extracted info displayed in a friendly way */}
            {entityDisplay.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  What I Know
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {entityDisplay.map((item, idx) => (
                    <div key={idx}>
                      <span style={{ marginRight: '4px' }}>{item.label}:</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quick Start
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '🎪 Plan a ceremony',
                  '🧑 Find a priest',
                  '🛕 Book temple pooja',
                  '🏛️ Find a function hall',
                  '📍 Find temples near me',
                  '📋 Preparation checklist',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.replace(/^[^\s]+\s/, ''))}
                    className="btn-ghost btn-sm"
                    style={{ textAlign: 'left', fontSize: '12px', padding: '6px 8px', background: 'var(--color-gray-50)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="ai-chat-container">
            <div className="ai-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                <div>
                  <strong style={{ fontSize: '14px' }}>Vedic Ceremony Assistant</strong>
                  <div style={{ fontSize: '11px', color: 'var(--color-sage)' }}>● Powered by AI + Verified Data</div>
                </div>
              </div>
              <Link href="/ceremony-services" className="btn-ghost btn-sm" style={{ fontSize: '12px' }}>
                Browse Services →
              </Link>
            </div>

            <div className="ai-messages-list">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'} animate-fade-in`}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                  {/* Direct Booking Lock Card */}
                  {msg.bookingHold && (
                    <div className="direct-booking-chat-card" style={{
                      marginTop: '12px',
                      background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF5E6 100%)',
                      border: '1.5px solid var(--color-saffron)',
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 8px 24px rgba(212, 168, 67, 0.15)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>🔒</span>
                          <strong style={{ fontSize: '13px', color: 'var(--color-saffron-dark)' }}>
                            15-Minute Slot Hold Active
                          </strong>
                        </div>
                        <span className="badge badge-verified" style={{ fontSize: '10px' }}>
                          ID: {msg.bookingHold.bookingId.slice(-6)}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--color-gray-700)', marginBottom: '10px', lineHeight: 1.6 }}>
                        <div><strong>Ceremony:</strong> {msg.bookingHold.ceremonyType}</div>
                        <div><strong>Location:</strong> {msg.bookingHold.location}</div>
                        <div><strong>Date:</strong> {msg.bookingHold.date}</div>
                        {msg.bookingHold.selectedPriest && <div><strong>Pandit:</strong> {msg.bookingHold.selectedPriest.name}</div>}
                        {msg.bookingHold.selectedVenue && <div><strong>Venue:</strong> {msg.bookingHold.selectedVenue.name}</div>}
                        <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-saffron-dark)' }}>
                          <strong>Hold Deposit:</strong> ₹{msg.bookingHold.depositAmount?.toLocaleString('en-IN') || '5,000'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link
                          href="/ceremony-plan"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, textAlign: 'center', padding: '6px 12px' }}
                        >
                          Review & Lock Booking →
                        </Link>
                        <button
                          onClick={toggleDrawer}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          View Plan (📋)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recommendations Cards from Real DB */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="ai-rec-grid">
                      {msg.recommendations.map((rec) => (
                        <div key={rec.id} className="ai-rec-card-mini">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '13px' }}>{rec.name}</strong>
                            {rec.matchScore && (
                              <span className="badge badge-verified" style={{ fontSize: '10px' }}>
                                {rec.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                            {rec.location} • {rec.priceLabel || 'Verified'}
                          </div>
                          {rec.matchReasons && rec.matchReasons.length > 0 && (
                            <div style={{ fontSize: '10px', color: 'var(--color-sage-dark)', marginBottom: '6px' }}>
                              ✓ {rec.matchReasons[0]}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px', width: '100%' }}
                              onClick={() => addToCeremony(rec)}
                            >
                              + Add to Plan
                            </button>
                            <Link
                              href={rec.type === 'venue' ? `/venue/${rec.id}` : rec.type === 'temple' ? `/temple/${rec.id}` : `/priest/${rec.id}`}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble chat-bubble-assistant animate-pulse">
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="ai-input-bar"
            >
              <input
                type="text"
                className="ai-input-field"
                placeholder="Tell me what ceremony you're planning..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                id="ai-chat-input"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={loading || !input.trim()}
                id="ai-chat-send-btn"
                style={{ padding: '0 18px' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="ai-page"><div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Loading AI Assistant...</div></div>}>
      <AIAssistantContent />
    </Suspense>
  );
}
