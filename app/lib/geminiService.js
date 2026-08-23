/**
 * @file geminiService.js
 * Backend-only Gemini LLM integration for AdhyatmaGO.
 * This module is called ONLY from server-side Route Handlers.
 * The GEMINI_API_KEY is never exposed to the browser.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import intentsConfig from '../../config/intents.json' with { type: 'json' };
import keywordsConfig from '../../config/keywords.json' with { type: 'json' };
import entitiesConfig from '../../config/entities.json' with { type: 'json' };
import requiredFieldsConfig from '../../config/required_fields.json' with { type: 'json' };

// Singleton GenAI client — initialized lazily
// Singleton GenAI client
let genAI = null;

const SUPPORTED_MODELS = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.6-flash'];

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Build the AdhyatmaGO-specific system prompt with website awareness & conversational intelligence.
 */
function buildSystemPrompt(currentEntities, currentIntent, conversationHistory) {
  const intentSummary = intentsConfig.intents.map(i =>
    `- ${i.intent_id}: ${i.description}. Required: [${i.required_fields.join(', ')}]. Optional: [${i.optional_fields.join(', ')}].`
  ).join('\n');

  const entityDescriptions = Object.entries(entitiesConfig.entities).map(([key, val]) =>
    `- ${key} (${val.type}): ${val.description}. Examples: ${JSON.stringify(val.examples?.slice(0, 4))}`
  ).join('\n');

  const keywordSamples = keywordsConfig.keywords.slice(0, 8).map(k =>
    `- "${k.canonical_name}": keywords=${JSON.stringify(k.keywords.slice(0, 5))}, Telugu=${JSON.stringify(k.Telugu_terms)}, mixed=${JSON.stringify(k.mixed_terms?.slice(0, 3))}`
  ).join('\n');

  // Build the accumulated context string
  const knownInfo = Object.entries(currentEntities || {})
    .filter(([_, v]) => v !== null && v !== undefined && (typeof v !== 'object' || (Array.isArray(v) && v.length > 0)))
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');

  return `You are the friendly, respectful, and highly knowledgeable official AdhyatmaGO AI Assistant (వేద సహాయకుడు).

## ABOUT OUR PLATFORM (ADHYATMAGO)
AdhyatmaGO is the leading Vedic ceremony planning and spiritual services platform for Hyderabad, Telangana, and Andhra Pradesh.
Our platform allows devotees and families to:
1. **Discover & Book Verified Pandits / Priests**: Vedic Acharyas with verified credentials for Griha Pravesham, Vivaha (Wedding), Namakaranam (Naming), Satyanarayan Puja, Upanayanam, Vastu Puja, Rudrabhishekam, and more. Supported languages: Telugu, Sanskrit, Hindi, Tamil, Kannada.
2. **Find Function Halls & Kalyana Mandapams**: Premium ceremony halls filtered by guest capacity (50 to 1000+), AC, dining facilities, parking, and catering in areas like Gachibowli, Madhapur, Kondapur, Jubilee Hills, Banjara Hills, Kukatpally, Miyapur.
3. **Explore Temples & Pooja Sevas**: Sacred temples in Hyderabad with verified daily darshan timings, special homams, archana, abhishekam, and seva bookings.
4. **Ceremony Preparation Checklists & Samagri**: Custom step-by-step preparation checklists, muhurtham timelines, and traditional puja samagri requirements (turmeric, kumkum, kalash, ghee, etc.).
5. **Direct 15-Minute Slot Hold & Secure Booking**: Real-time reservation lock, server-verified transactions, and dashboard management.

## CONVERSATIONAL STYLE & PERSONALITY (USER-FRIENDLY & EMPATHETIC)
1. **Always Be Warm, Welcoming, and Culturally Respectful**:
   - Begin answers with a warm greeting like "Namaste! 🙏" or "నమస్కారం! 🙏".
   - Speak with polite reverence and genuine enthusiasm for helping them conduct their sacred ceremonies smoothly.
   - If user speaks English → reply in friendly, clear English.
   - If user speaks Telugu (తెలుగు) → reply in respectful, beautiful Telugu.
   - If user speaks Tanglish (e.g. "Hyderabad lo Griha Pravesham ki priest kavali", "near Gachibowli", "next Sunday") → respond naturally in a friendly blend!

2. **Acknowledge What the User Provided & Guide Them Proactively**:
   - Explicitly confirm what the user already stated (e.g., "Got it! Planning a Griha Pravesham in Gachibowli on next Sunday.").
   - Intelligently suggest the next helpful steps or missing details (e.g. asking if they also need a kalyana mandapam/hall, or providing samagri checklist guidance).
   - If user asks for a wedding, suggest checking function halls and wedding puja samagri.
   - If user asks for Griha Pravesham, suggest Vastu puja alignment and milk boiling rituals.

3. **Direct Booking Mode (When user says "book", "reserve", "confirm booking", "lock slot", "బుక్ చేయండి", "బుకింగ్", etc.)**:
   - When the user explicitly requests to book or finalize, switch directly to booking mode!
   - Set "intent": "DIRECT_BOOKING" and "action": "START_BOOKING".
   - State clearly in your message that you are creating an active 15-minute slot hold for their verified Vedic pandit / venue, and they can review and confirm immediately.

## ANTI-REPETITION & CONTEXTUAL INTELLIGENCE
- **NEVER ask the same question twice.** If you already asked for a field and the user replied (even vaguely), accept their answer and move on.
- **Infer vague answers intelligently**: If user says "soon", "this month", or "sometime next week" for date → accept it as-is (e.g., "This Month", "Next Week"). If user says "nearby", "close by", "around here" for location → accept "Hyderabad" or their previously mentioned area.
- **Predict user goals from context**: If the conversation has been about Griha Pravesham and the user says "I also need a hall", you already know the ceremony type — don't re-ask it.
- **Handle misspellings and informal language**: "gruhapravesam", "house worming", "naming cermony", "pandith" — understand and proceed gracefully.
- **Provide direct, actionable responses**: Give specific, useful answers with enthusiasm.
- **Be conversational, not robotic**: Respond like a knowledgeable, caring friend who specializes in Vedic traditions.

## SUPPORTED INTENTS
${intentSummary}
- DIRECT_BOOKING: Immediate slot reservation and booking hold for ceremonies, pandits, and venues.

## ENTITIES YOU EXTRACT
${entityDescriptions}

## KEYWORD/LANGUAGE AWARENESS
${keywordSamples}

## CURRENT STATE
Current intent: ${currentIntent || 'NONE (detect from user message)'}
Currently known information: ${knownInfo || 'Nothing yet'}

## STRICT CONSTRAINTS
- You strictly help with AdhyatmaGO ceremony planning, priests, halls, temples, checklists, and rituals.
- If user asks something outside this scope (e.g. programming, weather, general knowledge), politely redirect back to ceremony planning.

## OUTPUT FORMAT (MANDATORY)
Respond with ONLY a valid JSON object matching this schema:
{
  "intent": "PRIEST_SEARCH",
  "state": "COLLECTING_REQUIREMENTS",
  "action": "ASK_REQUIRED_FIELD",
  "language": "en",
  "message": "Your warm, natural, and user-friendly response acknowledging what they said and guiding them to the next steps",
  "entities": {
    "event_purpose": null,
    "ceremony_type": null,
    "service_type": null,
    "tradition": null,
    "region": "Telangana",
    "location": null,
    "language": null,
    "date": null,
    "time": null,
    "budget": null,
    "guest_count": null,
    "preferences": []
  },
  "required_fields": [],
  "known_fields": [],
  "missing_fields": [],
  "invalid_fields": [],
  "ambiguous_fields": [],
  "next_question": null,
  "confidence": 0.95,
  "requires_backend_data": false,
  "requires_location_permission": false,
  "requires_practitioner_confirmation": false,
  "direct_booking": false
}

If all required fields for an intent are present, set action to "SEARCH_PRIESTS", "SEARCH_HALLS", "SEARCH_TEMPLES", or "SHOW_CHECKLIST" and set "requires_backend_data": true.
If the user requests to book directly, set intent to "DIRECT_BOOKING", action to "START_BOOKING", "direct_booking": true, and "requires_backend_data": true.`;
}

/**
 * Call Gemini with the AdhyatmaGO system prompt and user query.
 * Uses multi-model fallback across supported models to ensure continuous availability.
 *
 * @param {Object} params
 * @param {string} params.query - Current user message
 * @param {Array} params.history - Prior conversation turns
 * @param {string|null} params.currentIntent - Ongoing intent
 * @param {Object} params.currentEntities - Ongoing entity bag
 * @returns {Object} Structured AI response
 */
export async function callGemini({ query, history = [], currentIntent = null, currentEntities = {} }) {
  const client = getGenAI();
  const systemPrompt = buildSystemPrompt(currentEntities, currentIntent, history);

  // Build conversation history for context — only send sender + text
  const conversationContext = history
    .slice(-10)
    .map(msg => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      return `${role}: ${typeof msg.text === 'string' ? msg.text : ''}`;
    })
    .filter(line => line.length > 6)
    .join('\n');

  const fullPrompt = `${systemPrompt}

## RECENT CONVERSATION
${conversationContext || '(This is the start of the conversation)'}

## CURRENT USER MESSAGE
User: "${query}"

Respond with ONLY the JSON object:`;

  let lastError = null;

  // Try each supported model in order
  for (const modelName of SUPPORTED_MODELS) {
    try {
      const geminiModel = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const result = await geminiModel.generateContent(fullPrompt);
      const responseText = result.response.text().trim();

      // Extract JSON from the response
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      return validateGeminiResponse(parsed, currentEntities);
    } catch (error) {
      lastError = error;
      console.warn(`Model ${modelName} encountered error: ${error.message?.substring(0, 100)}. Trying next model...`);
    }
  }

  throw lastError;
}

/**
 * Validate and sanitize the Gemini response to ensure it follows our schema.
 * The backend is the final authority — we never trust model output blindly.
 */
function validateGeminiResponse(raw, previousEntities = {}) {
  const VALID_INTENTS = [
    'CEREMONY_PLANNING', 'PRIEST_SEARCH', 'TEMPLE_SEARCH', 'TEMPLE_POOJA',
    'HALL_SEARCH', 'RITUAL_GUIDANCE', 'CHECKLIST', 'NEARBY_TEMPLE',
    'DIRECT_BOOKING', 'GENERAL_APPLICATION_HELP', 'OUT_OF_SCOPE'
  ];

  const VALID_ACTIONS = [
    'ASK_REQUIRED_FIELD', 'ASK_CLARIFICATION', 'SEARCH_PRIESTS', 'SEARCH_TEMPLES',
    'SEARCH_TEMPLE_POOJA', 'SEARCH_HALLS', 'SEARCH_CEREMONIES', 'REQUEST_LOCATION_PERMISSION',
    'SHOW_CHECKLIST', 'SHOW_CEREMONY_GUIDANCE', 'SHOW_RESULTS', 'VIEW_ENTITY',
    'CHECK_AVAILABILITY', 'START_BOOKING', 'REVIEW_BOOKING', 'START_PAYMENT',
    'REVIEW_PAYMENT', 'EXPLAIN_RESULT', 'RESET_WORKFLOW', 'REDIRECT',
    'ESCALATE', 'NO_ACTION'
  ];

  const VALID_STATES = [
    'START', 'INTENT_DETECTION', 'COLLECTING_REQUIREMENTS', 'COMPLETED',
    'CHECKLIST_GENERATION', 'RITUAL_GUIDANCE', 'ESCALATION'
  ];

  // Sanitize intent
  const intent = VALID_INTENTS.includes(raw.intent) ? raw.intent : 'GENERAL_APPLICATION_HELP';
  const action = VALID_ACTIONS.includes(raw.action) ? raw.action : (raw.direct_booking ? 'START_BOOKING' : 'ASK_REQUIRED_FIELD');
  const state = VALID_STATES.includes(raw.state) ? raw.state : (raw.direct_booking ? 'COMPLETED' : 'COLLECTING_REQUIREMENTS');

  // Merge entities: prefer Gemini extraction over previous, but keep previous non-null values
  const entities = {
    event_purpose: raw.entities?.event_purpose || previousEntities.event_purpose || null,
    ceremony_type: raw.entities?.ceremony_type || previousEntities.ceremony_type || null,
    service_type: raw.entities?.service_type || previousEntities.service_type || null,
    tradition: raw.entities?.tradition || previousEntities.tradition || null,
    region: raw.entities?.region || previousEntities.region || 'Telangana',
    location: raw.entities?.location || previousEntities.location || null,
    language: raw.entities?.language || previousEntities.language || null,
    date: raw.entities?.date || previousEntities.date || null,
    time: raw.entities?.time || previousEntities.time || null,
    budget: raw.entities?.budget || previousEntities.budget || null,
    guest_count: raw.entities?.guest_count || previousEntities.guest_count || null,
    preferences: [
      ...new Set([
        ...(previousEntities.preferences || []),
        ...(raw.entities?.preferences || [])
      ])
    ],
  };

  // Validate required fields for the intent
  const intentConfig = requiredFieldsConfig[intent] || { required: ['ceremony_type', 'location', 'date'] };
  const requiredFields = intentConfig?.required || [];
  const knownFields = requiredFields.filter(f => entities[f]);
  const missingFields = requiredFields.filter(f => !entities[f]);

  // Safety: don't allow SEARCH_* actions if missing fields exist
  const isSearchAction = action.startsWith('SEARCH_') || action === 'SHOW_RESULTS';
  const finalAction = (isSearchAction && missingFields.length > 0) ? 'ASK_REQUIRED_FIELD' : action;
  const finalState = (finalAction === 'ASK_REQUIRED_FIELD') ? 'COLLECTING_REQUIREMENTS' : state;

  return {
    intent,
    state: finalState,
    action: finalAction,
    language: raw.language || 'en',
    message: typeof raw.message === 'string' ? raw.message : 'How can I help with your ceremony planning?',
    entities,
    required_fields: requiredFields,
    known_fields: knownFields,
    missing_fields: missingFields,
    invalid_fields: Array.isArray(raw.invalid_fields) ? raw.invalid_fields : [],
    ambiguous_fields: Array.isArray(raw.ambiguous_fields) ? raw.ambiguous_fields : [],
    next_question: raw.next_question || null,
    confidence: typeof raw.confidence === 'number' ? Math.min(raw.confidence, 1.0) : 0.8,
    requires_backend_data: finalAction.startsWith('SEARCH_') || finalAction === 'SHOW_RESULTS' || finalAction === 'START_BOOKING' || raw.direct_booking === true,
    requires_location_permission: raw.requires_location_permission === true,
    requires_practitioner_confirmation: raw.requires_practitioner_confirmation === true,
    direct_booking: raw.direct_booking === true || finalAction === 'START_BOOKING',
  };
}

/**
 * Check whether Gemini is available (key is configured).
 */
export function isGeminiAvailable() {
  return !!process.env.GEMINI_API_KEY;
}
