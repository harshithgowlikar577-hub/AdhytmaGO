/**
 * @file aiController.js
 * Strict AI / LLM Conversational Controller for AdhyatmaGO
 * PRIMARY: Gemini LLM via geminiService.js (when GEMINI_API_KEY is set)
 * FALLBACK: Built-in regex/keyword state machine (when Gemini is unavailable)
 */

import { getRankedPriests, getRankedVenues } from './recommendationEngine';
import { temples, ceremonyTypes } from '../data/mockData';
import { callGemini, isGeminiAvailable } from './geminiService';

// Required fields map per intent
const INTENT_REQUIREMENTS = {
  PRIEST_SEARCH: ['ceremony_type', 'location', 'date'],
  HALL_SEARCH: ['location', 'date', 'guest_count'],
  TEMPLE_SEARCH: ['location'],
  TEMPLE_POOJA: ['temple', 'pooja', 'date'],
  CEREMONY_PLANNING: ['event_purpose', 'location', 'date'],
  NEARBY_TEMPLE: ['location'],
  RITUAL_GUIDANCE: ['ceremony_type'],
  CHECKLIST: ['ceremony_type'],
  GENERAL_APPLICATION_HELP: [],
  OUT_OF_SCOPE: [],
};

/**
 * Detect user language (en or te)
 */
function detectLanguage(text = '') {
  // Check for Telugu Unicode range: \u0C00-\u0C7F
  const teluguRegex = /[\u0C00-\u0C7F]/;
  if (teluguRegex.test(text)) return 'te';
  const lower = text.toLowerCase();
  if (lower.includes('telugu') || lower.includes('namaste') || lower.includes('pandit ji') || lower.includes('swamy')) {
    // English-Telugu mixed
    return 'en';
  }
  return 'en';
}

/**
 * Extract entities from user query
 */
function extractEntities(query = '', previousEntities = {}) {
  const q = query.toLowerCase();
  const entities = {
    event_purpose: previousEntities.event_purpose || null,
    ceremony_type: previousEntities.ceremony_type || null,
    service_type: previousEntities.service_type || null,
    tradition: previousEntities.tradition || null,
    region: previousEntities.region || 'Telangana',
    location: previousEntities.location || null,
    latitude: previousEntities.latitude || null,
    longitude: previousEntities.longitude || null,
    language: previousEntities.language || null,
    date: previousEntities.date || null,
    time: previousEntities.time || null,
    budget: previousEntities.budget || null,
    guest_count: previousEntities.guest_count || null,
    preferences: [...(previousEntities.preferences || [])],
  };

  // 1. Ceremony type extraction & indirect requests
  if (
    q.includes('housewarming') || q.includes('griha') || q.includes('gruha') || 
    q.includes('గృహప్రవేశం') || q.includes('pravesh') || q.includes('new house') ||
    q.includes('new home') || q.includes('shifting to') || q.includes('bought a flat')
  ) {
    entities.ceremony_type = 'Griha Pravesham';
    entities.event_purpose = 'Housewarming / House-Entry Ceremony';
  } else if (q.includes('wedding') || q.includes('marriage') || q.includes('vivaha') || q.includes('వివాహం') || q.includes('kalyanam') || q.includes('pelli')) {
    entities.ceremony_type = 'Wedding Ceremony';
    entities.event_purpose = 'Marriage Celebration';
  } else if (q.includes('naming') || q.includes('namakaranam') || q.includes('నామకరణం') || q.includes('baby naming')) {
    entities.ceremony_type = 'Naming Ceremony';
    entities.event_purpose = 'Naming of Newborn';
  } else if (q.includes('satyanarayan') || q.includes('satyanarayana') || q.includes('సత్యనారాయణ')) {
    entities.ceremony_type = 'Satyanarayan Puja';
    entities.event_purpose = 'Satyanarayan Vratam';
  } else if (q.includes('upanayanam') || q.includes('thread') || q.includes('ఉపనయనం')) {
    entities.ceremony_type = 'Upanayanam';
    entities.event_purpose = 'Sacred Thread Ceremony';
  } else if (q.includes('vastu') || q.includes('వాస్తు')) {
    entities.ceremony_type = 'Vastu Puja';
    entities.event_purpose = 'Vastu Purification';
  } else if (q.includes('ganesh') || q.includes('ganapathi') || q.includes('వినాయక')) {
    entities.ceremony_type = 'Ganesh Puja';
    entities.event_purpose = 'Ganesh Puja';
  }

  // 2. Location extraction (including 'hyd' abbreviation)
  const locations = [
    'gachibowli', 'kondapur', 'madhapur', 'kukatpally', 'jubilee hills',
    'banjara hills', 'miyapur', 'hitech city', 'kphb', 'secunderabad',
    'begumpet', 'ameerpet', 'hyderabad', 'telangana'
  ];
  if (q.includes('hyd') && !entities.location) {
    entities.location = 'Hyderabad';
  }
  for (const loc of locations) {
    if (q.includes(loc)) {
      entities.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // 3. Language preference extraction
  if (q.includes('telugu') || q.includes('తెలుగు')) {
    entities.language = 'Telugu';
  } else if (q.includes('hindi') || q.includes('హిందీ')) {
    entities.language = 'Hindi';
  } else if (q.includes('tamil') || q.includes('తమిళం')) {
    entities.language = 'Tamil';
  } else if (q.includes('kannada') || q.includes('కన్నడ')) {
    entities.language = 'Kannada';
  } else if (q.includes('sanskrit') || q.includes('సంస్కృతం')) {
    entities.language = 'Sanskrit';
  }

  // 4. Date extraction
  if (q.includes('next sunday') || q.includes('sunday') || q.includes('ఆదివారం')) {
    entities.date = 'Next Sunday';
  } else if (q.includes('tomorrow') || q.includes('రేపు')) {
    entities.date = 'Tomorrow';
  } else if (q.includes('next week') || q.includes('వచ్చే వారం') || q.includes('next month')) {
    entities.date = q.includes('next month') ? 'Next Month' : 'Next Week';
  } else {
    const dateMatch = q.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/);
    if (dateMatch) {
      entities.date = dateMatch[0];
    } else {
      const monthMatch = q.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b/i);
      if (monthMatch) entities.date = monthMatch[0];
    }
  }

  // 5. Guest count extraction (e.g. 500 ppl, 400 members, 300 guests)
  const guestMatch = q.match(/(\d+)\s*(people|guests|members|capacity|persons|మంది|ppl)/i);
  if (guestMatch) {
    entities.guest_count = guestMatch[1];
  }

  // 6. Budget extraction (e.g. under 1 lakh, 50k, 5000, 1lakh)
  if (q.includes('lakh') || q.includes('1 lakh') || q.includes('1lakh')) {
    entities.budget = '₹1,00,000';
  } else if (q.includes('50k')) {
    entities.budget = '₹50,000';
  } else if (q.includes('5k')) {
    entities.budget = '₹5,000';
  }

  // 7. Experience / practitioner preferences
  if (q.includes('experienced') || q.includes('senior') || q.includes('వేద పండితులు')) {
    if (!entities.preferences.includes('experienced')) entities.preferences.push('experienced');
  }

  return entities;
}

/**
 * Detect Intent
 */
function detectIntent(query = '', previousIntent = null, previousEntities = {}) {
  const q = query.toLowerCase().trim();

  // 0. Greetings & conversational phrases → GENERAL_APPLICATION_HELP
  const greetingPatterns = [
    /^(hi|hello|hey|hii+|helo|namaste|namaskar|namasthe|namaskaram|howdy|sup|yo)\b/,
    /^(good\s*(morning|afternoon|evening|day))\b/,
    /^(how\s*are\s*you|what's\s*up|whats\s*up|how\s*do\s*you\s*do)/,
    /^(నమస్కారం|నమస్తే|హలో|హాయ్)/,
    /^(what\s*can\s*you\s*do|help|help\s*me|what\s*do\s*you\s*offer)/,
  ];
  if (greetingPatterns.some(p => p.test(q))) {
    return 'GENERAL_APPLICATION_HELP';
  }

  // 1. Explicit intent resets
  if (q.includes('forget the priest') || q.includes('want a hall instead') || q.includes('function hall instead') || q.includes('find venue instead')) {
    return 'HALL_SEARCH';
  }
  if (q.includes('forget the hall') || q.includes('want a priest instead') || q.includes('find priest instead')) {
    return 'PRIEST_SEARCH';
  }

  // 2. Out of scope questions
  const outOfScopePatterns = [
    /what is (java|python|javascript|react|html|css)\b/,
    /\b(write code|programming|stock market|bitcoin|crypto|weather in|who won|football|cricket score)\b/,
  ];
  if (outOfScopePatterns.some(p => p.test(q))) {
    return 'OUT_OF_SCOPE';
  }

  // 3. General questions about ceremonies / rituals
  if (q.startsWith('what is') || q.startsWith('tell me about') || q.includes('meaning of')) {
    if (q.includes('griha') || q.includes('vivaha') || q.includes('namakaranam') || q.includes('puja') || q.includes('pooja') || q.includes('upanayanam') || q.includes('vastu')) {
      return 'RITUAL_GUIDANCE';
    }
  }

  // 4. Checklist
  if (q.includes('checklist') || q.includes('materials') || q.includes('samagri') || q.includes('సామగ్రి')) {
    return 'CHECKLIST';
  }

  // 5. Nearby temple / temple search
  if (q.includes('nearby temple') || q.includes('temples near me') || q.includes('temple near') || q.includes('nearest temple') || q.includes('nearest mandir') || q.includes('mandir near') || q.includes('గుడులు') || q.includes('గుడి')) {
    return 'NEARBY_TEMPLE';
  }
  if (q.includes('temple') || q.includes('mandir') || q.includes('darshan') || q.includes('archana') || q.includes('seva') || q.includes('దేవాలయం')) {
    return (q.includes('pooja') || q.includes('puja') || q.includes('పూజ')) ? 'TEMPLE_POOJA' : 'TEMPLE_SEARCH';
  }

  // 6. Hall / venue search (broad keyword coverage)
  if (q.includes('hall') || q.includes('mandapam') || q.includes('venue') || q.includes('convention') || q.includes('మండపం') || q.includes('కల్యాణ')) {
    return 'HALL_SEARCH';
  }

  // 7. Priest search (broad keyword coverage including Telugu/informal)
  if (
    q.includes('priest') || q.includes('pandit') || q.includes('purohit') || q.includes('poojari') || q.includes('pujari') ||
    q.includes('swamy') || q.includes('acharya') || q.includes('pandith') || q.includes('pantulu') ||
    q.includes('శాస్త్రి') || q.includes('పంతులు') || q.includes('పురోహిత') || q.includes('పూజారి') ||
    /\bkavali\b/.test(q) || /\bkavali\b/.test(q.replace(/priest|pandit|purohit|poojari/g, ''))
  ) {
    return 'PRIEST_SEARCH';
  }
  // "kavali" alone with ceremony/puja context → priest search
  if (q.includes('kavali') && (q.includes('pooja') || q.includes('puja') || q.includes('pandit') || q.includes('priest'))) {
    return 'PRIEST_SEARCH';
  }
  // "naaku ... kavali" pattern (Telugu: "I need...")
  if (/naaku.*kavali/.test(q) || /naku.*kavali/.test(q)) {
    // Check if they mention priest/hall/temple keywords
    if (q.includes('priest') || q.includes('pandit') || q.includes('purohit') || q.includes('poojari') || q.includes('pantulu') || q.includes('పంతులు')) {
      return 'PRIEST_SEARCH';
    }
    if (q.includes('hall') || q.includes('venue') || q.includes('mandapam') || q.includes('మండపం')) {
      return 'HALL_SEARCH';
    }
    // Generic "kavali" with no specific service → ceremony planning
    return 'CEREMONY_PLANNING';
  }

  // 8. Ceremony planning — explicit ceremony names and related keywords
  const ceremonyNames = [
    'griha', 'pravesham', 'housewarming', 'vivaha', 'wedding', 'marriage', 'kalyanam', 'pelli',
    'namakaranam', 'naming', 'baby naming', 'satyanarayan', 'satyanarayana', 'upanayanam',
    'thread ceremony', 'vastu', 'ganesh puja', 'ganapathi', 'seemantham', 'annaprasana',
    'shashtiabdapoorthy', 'gruha', 'గృహప్రవేశం', 'వివాహం', 'నామకరణం', 'సత్యనారాయణ',
  ];
  if (q.includes('plan') || q.includes('ceremony') || q.includes('organize') || q.includes('arrange') || q.includes('book') || q.includes('వేడుక') || ceremonyNames.some(n => q.includes(n))) {
    return 'CEREMONY_PLANNING';
  }

  // 9. If the user provides just a location and we are mid-workflow collecting requirements → keep previous intent
  const locationWords = [
    'gachibowli', 'kondapur', 'madhapur', 'kukatpally', 'jubilee hills',
    'banjara hills', 'miyapur', 'hitech city', 'kphb', 'secunderabad',
    'begumpet', 'ameerpet', 'hyderabad', 'telangana', 'hyd',
    'kompally', 'uppal', 'dilsukhnagar', 'lb nagar', 'mehdipatnam',
    'tolichowki', 'manikonda', 'lingampally', 'chandanagar'
  ];
  const isLocationOnly = locationWords.some(loc => q.includes(loc)) && q.split(/\s+/).length <= 4;

  // 10. Keep previous intent if in the middle of a workflow AND user provides data (location, date, etc.)
  if (previousIntent && INTENT_REQUIREMENTS[previousIntent]) {
    // If it looks like the user is answering a missing field question
    const previousRequired = INTENT_REQUIREMENTS[previousIntent];
    const previousMissing = previousRequired.filter(f => !previousEntities[f]);
    if (previousMissing.length > 0) {
      return previousIntent; // Continue the current workflow
    }
    // Even if nothing is missing, if it's a short answer, stay in workflow
    if (q.split(/\s+/).length <= 4) {
      return previousIntent;
    }
  }

  // 11. If input is only a location name with no previous context → general help
  if (isLocationOnly && !previousIntent) {
    return 'GENERAL_APPLICATION_HELP';
  }

  // 12. Default: GENERAL_APPLICATION_HELP (not PRIEST_SEARCH)
  return 'GENERAL_APPLICATION_HELP';
}

/**
 * Main Controller Step Function
 * @param {Object} params
 * @param {string} params.query - Current user message
 * @param {Object} [params.history] - Prior conversation turns
 * @param {string} [params.currentIntent] - Ongoing intent state
 * @param {Object} [params.currentEntities] - Ongoing entity bag
 */
export async function processAIConversation({ query, history = [], currentIntent = null, currentEntities = {} }) {
  let geminiErrorType = null;
  // === PRIMARY: Try Gemini LLM ===
  if (isGeminiAvailable()) {
    try {
      const geminiResponse = await callGemini({ query, history, currentIntent, currentEntities });

      // Handle Direct Booking action: attach locked services and create booking hold
      if (geminiResponse.action === 'START_BOOKING' || geminiResponse.intent === 'DIRECT_BOOKING' || geminiResponse.direct_booking) {
        const priestMatches = getRankedPriests({
          ceremony_type: geminiResponse.entities.ceremony_type,
          language: geminiResponse.entities.language,
          location: geminiResponse.entities.location,
        });
        const venueMatches = getRankedVenues({
          guest_count: geminiResponse.entities.guest_count,
          location: geminiResponse.entities.location,
        });

        const selectedPriest = priestMatches[0] || null;
        const selectedVenue = (geminiResponse.entities.guest_count || geminiResponse.entities.service_type === 'venue') ? venueMatches[0] : null;

        const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const depositAmount = (selectedPriest ? 5000 : 0) + (selectedVenue ? 15000 : 0) || 5000;

        geminiResponse.bookingHold = {
          bookingId,
          ceremonyType: geminiResponse.entities.ceremony_type || 'Sacred Ceremony',
          location: geminiResponse.entities.location || 'Hyderabad',
          date: geminiResponse.entities.date || 'Upcoming Date',
          guestCount: geminiResponse.entities.guest_count || 'Standard',
          selectedPriest,
          selectedVenue,
          depositAmount,
          currency: 'INR',
          status: 'HOLD',
          holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };

        geminiResponse.recommendations = [selectedPriest, selectedVenue].filter(Boolean);
        geminiResponse.requires_backend_data = true;
      }

      // Attach real database recommendations when Gemini triggers a search action
      else if (geminiResponse.action === 'SEARCH_PRIESTS' && geminiResponse.missing_fields.length === 0) {
        const results = getRankedPriests({
          ceremony_type: geminiResponse.entities.ceremony_type,
          language: geminiResponse.entities.language,
          location: geminiResponse.entities.location,
        });
        geminiResponse.recommendations = results.slice(0, 4);
        geminiResponse.requires_backend_data = true;
      } else if (geminiResponse.action === 'SEARCH_HALLS' && geminiResponse.missing_fields.length === 0) {
        const results = getRankedVenues({
          guest_count: geminiResponse.entities.guest_count,
          location: geminiResponse.entities.location,
        });
        geminiResponse.recommendations = results.slice(0, 4);
        geminiResponse.requires_backend_data = true;
      } else if ((geminiResponse.action === 'SEARCH_TEMPLES' || geminiResponse.intent === 'NEARBY_TEMPLE') && geminiResponse.missing_fields.length === 0) {
        geminiResponse.recommendations = temples.slice(0, 4).map(t => ({
          ...t,
          matchScore: 90,
          matchReasons: [`Located in ${t.area}`, `${t.services?.length || 0} services available`],
        }));
        geminiResponse.requires_backend_data = true;
      }

      return geminiResponse;
    } catch (geminiError) {
      console.warn('Gemini LLM failed, falling back to built-in engine:', geminiError.message);
      // Track the error type for downstream handling
      geminiErrorType = geminiError.isRateLimit ? 'rate_limit' : (geminiError.isTransient ? 'transient' : 'error');
      // Fall through to regex-based engine below
    }
  }

  // === FALLBACK: Built-in regex/keyword engine ===
  const lang = detectLanguage(query);
  const intent = detectIntent(query, currentIntent, currentEntities);
  const entities = extractEntities(query, currentEntities);

  // Fallback flag — lets the frontend know AI is in reduced mode
  const fallbackMeta = { wasGeminiFallback: true, geminiErrorType };

  // 0. Handle Greetings & General Help — friendly welcome, not ceremony question
  if (intent === 'GENERAL_APPLICATION_HELP') {
    const msg = lang === 'te'
      ? 'నమస్కారం! 🙏 నేను మీ అధ్యాత్మGO వేద సహాయకుడిని. మీకు ఏమి సహాయం కావాలి? పురోహితులు, గుడులు, కల్యాణ మండపాలు, లేదా పూజ సామగ్రి — అన్నీ సహాయం చేస్తాను!'
      : "Namaste! 🙏 I'm your AdhyatmaGO ceremony assistant. I can help you find verified priests, book temple poojas, find function halls, or prepare ceremony checklists. What would you like to do?";

    return {
      intent: 'GENERAL_APPLICATION_HELP',
      state: 'START',
      action: 'NO_ACTION',
      language: lang,
      message: msg,
      entities,
      required_fields: [],
      known_fields: [],
      missing_fields: [],
      invalid_fields: [],
      ambiguous_fields: [],
      next_question: null,
      confidence: 0.95,
      requires_backend_data: false,
      requires_location_permission: false,
      requires_practitioner_confirmation: false,
      backend_action: null,
      ...fallbackMeta,
    };
  }

  // 1. Handle Out of Scope queries politely
  if (intent === 'OUT_OF_SCOPE') {
    const msg = lang === 'te'
      ? 'అధ్యాత్మGO వేద పూజలు, పురోహితులు, కల్యాణ మండపాలు మరియు పూజా సామగ్రి మార్గదర్శకత్వానికి అంకితమైన వేదిక. మీ పవిత్ర వేడుక ప్రణాళికలో నేను మీకు ఎలా సహాయపడగలను?'
      : "AdhyatmaGO is dedicated to ceremony planning, verified Vedic pandits, temple poojas, and function halls. How can I assist you with your ceremony planning today?";

    return {
      intent: 'OUT_OF_SCOPE',
      state: 'START',
      action: 'REDIRECT',
      language: lang,
      message: msg,
      entities,
      required_fields: [],
      known_fields: [],
      missing_fields: [],
      invalid_fields: [],
      ambiguous_fields: [],
      next_question: 'Which ceremony would you like to plan?',
      confidence: 0.98,
      requires_backend_data: false,
      requires_location_permission: false,
      requires_practitioner_confirmation: false,
      backend_action: null,
      ...fallbackMeta,
    };
  }

  // 2. Handle Checklist queries
  if (intent === 'CHECKLIST') {
    const ceremony = entities.ceremony_type || 'Griha Pravesham';
    const msg = lang === 'te'
      ? `${ceremony} కోసం తయారీ చెక్‌లిస్ట్ సిద్ధం చేయబడింది. ప్రధాన పూజా సామగ్రి: పసుపు, కుంకుమ, బియ్యం, కలశం, నవధాన్యాలు, దీపారాధన కుందులు మరియు మామిడి ఆకులు.`
      : `Preparation Checklist for ${ceremony}: Essential items include Turmeric, Kumkum, Akshata (Rice), Kalash with Coconut, Navadhanya, Ghee, Lamp wicks, and Mango leaves.`;

    return {
      intent: 'CHECKLIST',
      state: 'CHECKLIST_GENERATION',
      action: 'SHOW_CHECKLIST',
      language: lang,
      message: msg,
      entities,
      required_fields: ['ceremony_type'],
      known_fields: ['ceremony_type'],
      missing_fields: [],
      invalid_fields: [],
      ambiguous_fields: [],
      next_question: null,
      confidence: 0.95,
      requires_backend_data: true,
      requires_location_permission: false,
      requires_practitioner_confirmation: true,
      selected_entity: null,
      backend_action: { ceremony_type: ceremony },
      ...fallbackMeta,
    };
  }

  // 3. Handle Ritual Guidance
  if (intent === 'RITUAL_GUIDANCE') {
    const q2 = query.toLowerCase();
    const ceremony = entities.ceremony_type || (
      q2.includes('griha') || q2.includes('pravesham') || q2.includes('housewarming') ? 'Griha Pravesham' :
      q2.includes('vivaha') || q2.includes('wedding') || q2.includes('marriage') ? 'Wedding Ceremony' :
      q2.includes('namakaranam') || q2.includes('naming') ? 'Naming Ceremony' :
      q2.includes('satyanarayan') ? 'Satyanarayan Puja' :
      q2.includes('upanayanam') || q2.includes('thread') ? 'Upanayanam' :
      q2.includes('vastu') ? 'Vastu Puja' : 'Griha Pravesham'
    );

    const descriptions = {
      'Griha Pravesham': 'a sacred Vedic house-warming ceremony performed to purify and consecrate a new home before moving in, inviting prosperity and positive energy.',
      'Wedding Ceremony': 'a sacred Vedic marriage ceremony (Vivah Sanskara) that unites two souls through sacred rituals, fire rituals (Saptapadi), and blessings.',
      'Naming Ceremony': 'a sacred Vedic ceremony (Namakaranam) performed on the 11th or 12th day after birth to officially name the newborn with blessings.',
      'Satyanarayan Puja': 'a devotional puja performed in honor of Lord Vishnu (Satyanarayan) to give thanks, seek blessings, and fulfill vows.',
      'Upanayanam': 'the sacred thread ceremony (Yagnopaveetam) marking a young boy\'s formal initiation into Vedic studies and spiritual life.',
      'Vastu Puja': 'a Vedic ritual to harmonize the energies of a building or plot with the five elements, removing doshas and ensuring peace and prosperity.',
    };
    const desc = descriptions[ceremony] || 'a sacred Vedic ceremony with deep spiritual significance.';
    const msg = lang === 'te'
      ? `${ceremony} అనేది ${desc} మీకు ఈ వేడుక కోసం పురోహితుని కనుగొనడంలో సహాయం చేయనా?`
      : `${ceremony} is ${desc} Would you like me to help you find a verified priest for this ceremony?`;

    const reqs = INTENT_REQUIREMENTS.PRIEST_SEARCH;
    const known = Object.keys(entities).filter(k => reqs.includes(k) && entities[k]);
    const missing = reqs.filter(r => !entities[r]);

    return {
      intent: 'RITUAL_GUIDANCE',
      state: 'RITUAL_GUIDANCE',
      action: 'SHOW_GUIDANCE',
      language: lang,
      message: msg,
      entities,
      required_fields: reqs,
      known_fields: known,
      missing_fields: missing,
      invalid_fields: [],
      ambiguous_fields: [],
      next_question: missing.length > 0 ? `Would you like me to find a priest for ${ceremony}?` : null,
      confidence: 0.92,
      requires_backend_data: false,
      requires_location_permission: false,
      requires_practitioner_confirmation: false,
      selected_entity: null,
      backend_action: null,
      ...fallbackMeta,
    };
  }

  // 4. Evaluate Mandatory Fields for the Intent
  const required = INTENT_REQUIREMENTS[intent] || ['location'];
  const known = required.filter(field => entities[field]);
  const missing = required.filter(field => !entities[field]);

  // If mandatory fields are missing: ASK Specifically for the first missing field
  if (missing.length > 0) {
    const nextField = missing[0];
    let askMsg = '';

    if (nextField === 'ceremony_type') {
      askMsg = lang === 'te'
        ? 'మీరు ఏ పవిత్ర వేడుకను నిర్వహించాలనుకుంటున్నారు? (ఉదాహరణ: గృహప్రవేశం, వివాహం, నామకరణం)'
        : 'Which ceremony are you planning? (e.g., Griha Pravesham, Wedding, Naming Ceremony)';
    } else if (nextField === 'location') {
      askMsg = lang === 'te'
        ? 'హైదరాబాద్‌లో ఏ ప్రాంతంలో లేదా నగరంలో వెతకాలి? (ఉదాహరణ: గచ్చిబౌలి, మాదాపూర్, కూకట్‌పల్లి)'
        : 'Which city or area in Hyderabad should I search in? (e.g., Gachibowli, Madhapur, Kukatpally)';
    } else if (nextField === 'date') {
      askMsg = lang === 'te'
        ? 'వేడుకను ఏ తేదీన నిర్వహించాలని అనుకుంటున్నారు?'
        : 'What date are you planning the ceremony?';
    } else if (nextField === 'guest_count') {
      askMsg = lang === 'te'
        ? 'సుమారు ఎంతమంది అతిథులు హాజరవుతారు?'
        : 'Approximately how many guests are expected?';
    } else {
      askMsg = `Please provide the ${nextField.replace('_', ' ')}.`;
    }

    // Acknowledge partially provided info (related but insufficient input rule)
    let prefix = '';
    if (entities.language && !currentEntities?.language) {
      prefix = lang === 'te' ? `నేను ${entities.language} మాట్లాడే పురోహితుల ప్రాధాన్యతను నమోదు చేసుకున్నాను. ` : `Noted your ${entities.language} language preference. `;
    }
    if (entities.preferences?.includes('experienced') && !currentEntities?.preferences?.includes('experienced')) {
      prefix += (lang === 'te' ? 'అనుభవజ్ఞులైన పండితుల ప్రాధాన్యత గుర్తించబడింది. ' : 'Noted preference for an experienced Vedic pandit. ');
    }

    return {
      intent,
      state: 'COLLECTING_REQUIREMENTS',
      action: 'ASK_REQUIRED_FIELD',
      language: lang,
      message: prefix + askMsg,
      entities,
      required_fields: required,
      known_fields: known,
      missing_fields: missing,
      invalid_fields: [],
      ambiguous_fields: [],
      next_question: askMsg,
      confidence: 0.95,
      requires_backend_data: false,
      requires_location_permission: false,
      requires_practitioner_confirmation: false,
      selected_entity: null,
      backend_action: null,
      ...fallbackMeta,
    };
  }

  // 5. ALL MANDATORY FIELDS PRESENT -> Execute Backend Query
  let results = [];
  let action = 'SHOW_RESULTS';
  let completionMessage = '';

  if (intent === 'PRIEST_SEARCH') {
    action = 'SEARCH_PRIESTS';
    results = getRankedPriests({
      ceremony_type: entities.ceremony_type,
      language: entities.language,
      location: entities.location,
    });
    completionMessage = lang === 'te'
      ? `${entities.location} లో ${entities.ceremony_type} కోసం ${results.length} మంది ధృవీకరించబడిన వేద పురోహితులు కనుగొనబడ్డారు.`
      : `Found ${results.length} verified Vedic pandits in ${entities.location} for ${entities.ceremony_type} on ${entities.date}.`;
  } else if (intent === 'HALL_SEARCH') {
    action = 'SEARCH_HALLS';
    results = getRankedVenues({
      guest_count: entities.guest_count,
      location: entities.location,
    });
    completionMessage = lang === 'te'
      ? `${entities.location} లో ${entities.guest_count} అతిథుల సామర్థ్యం కలిగిన ఫంక్షన్ హాళ్ళు కనుగొనబడ్డాయి.`
      : `Found ${results.length} function halls in ${entities.location} matching capacity for ${entities.guest_count} guests.`;
  } else if (intent === 'TEMPLE_SEARCH' || intent === 'NEARBY_TEMPLE') {
    action = 'SEARCH_TEMPLES';
    results = temples;
    completionMessage = lang === 'te'
      ? `${entities.location} దగ్గర ఉన్న పవిత్ర దేవాలయాలు మరియు సేవల వివరాలు:`
      : `Sacred temples and available pooja services near ${entities.location}:`;
  } else {
    action = 'SHOW_RESULTS';
    results = getRankedPriests({ ceremony_type: entities.ceremony_type });
    completionMessage = `Ceremony plan initialized for ${entities.ceremony_type || 'your event'}.`;
  }

  return {
    intent,
    state: 'COMPLETED',
    action,
    language: lang,
    message: completionMessage,
    entities,
    required_fields: required,
    known_fields: known,
    missing_fields: [],
    invalid_fields: [],
    ambiguous_fields: [],
    next_question: null,
    confidence: 0.98,
    requires_backend_data: true,
    requires_location_permission: intent === 'NEARBY_TEMPLE',
    requires_practitioner_confirmation: false,
    selected_entity: null,
    backend_action: {
      intent,
      ceremony_type: entities.ceremony_type,
      location: entities.location,
      date: entities.date,
      language: entities.language,
      guest_count: entities.guest_count,
    },
    recommendations: results.slice(0, 4),
    ...fallbackMeta,
  };
}
