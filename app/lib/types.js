/**
 * @file types.js
 * Centralized Typed Data Contracts for AdhyatmaGO
 * Consistent data models across Frontend, Backend, AI & Payment modules.
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - Unique User ID (Firebase UID)
 * @property {string} email - User Email address
 * @property {string} full_name - Full display name
 * @property {number} [age] - Age
 * @property {string} [phone] - Contact phone number
 * @property {string} [address] - Address
 * @property {boolean} onboarding_completed - Whether onboarding profile form was completed
 * @property {'user' | 'priest' | 'temple_admin' | 'venue_admin' | 'admin'} role - User role
 * @property {string} [created_at] - ISO Timestamp
 * @property {string} [updated_at] - ISO Timestamp
 */

/**
 * @typedef {Object} Priest
 * @property {string} id - Provider identifier (e.g., 'p1')
 * @property {'priest'} type - Entity type
 * @property {string} name - Priest full name
 * @property {string} [image] - Profile photo URI
 * @property {string} [pdfUrl] - Official verified credentials PDF
 * @property {string} [avatarColor] - Fallback avatar color
 * @property {string} location - Display location (e.g. 'Gachibowli, Hyderabad')
 * @property {string} area - Area name
 * @property {number} distance - Distance in km from active search location
 * @property {string[]} specialization - List of ceremony specializations
 * @property {string[]} languages - Languages spoken
 * @property {number} experience - Years of experience
 * @property {number} rating - Average review rating (1.0 - 5.0)
 * @property {number} reviewCount - Number of verified reviews
 * @property {string} priceLabel - Display price range
 * @property {'₹' | '₹₹' | '₹₹₹'} priceRange - Price category
 * @property {'available' | 'request' | 'unavailable'} availability - Availability status
 * @property {boolean} verified - Whether verified by platform
 * @property {string} description - Biography and ceremony description
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} [matchScore] - Calculated match score (0-100) from recommendation engine
 * @property {string[]} [matchReasons] - Algorithmic reasons for match score
 */

/**
 * @typedef {Object} Temple
 * @property {string} id - Temple identifier (e.g., 't1')
 * @property {'temple'} type - Entity type
 * @property {string} name - Temple name
 * @property {string} [image] - Photo URI
 * @property {string} location - Location string
 * @property {string} area - Area name
 * @property {number} distance - Distance in km
 * @property {string[]} services - Available poojas / sevas
 * @property {string} timings - Temple opening and darshan timings
 * @property {boolean} accessibility - Wheelchair / accessibility support
 * @property {'available' | 'request' | 'unavailable'} availability - Booking availability
 * @property {number} rating - Rating (1.0 - 5.0)
 * @property {number} reviewCount - Review count
 * @property {string} description - Temple details and history
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} Venue
 * @property {string} id - Venue identifier (e.g., 'v1')
 * @property {'venue'} type - Entity type
 * @property {string} name - Venue / Function Hall name
 * @property {string} [image] - Photo URI
 * @property {string} [pdfUrl] - Venue brochure PDF
 * @property {string} location - Location string
 * @property {string} area - Area name
 * @property {number} distance - Distance in km
 * @property {number} capacity - Guest capacity
 * @property {string} priceLabel - Price starting string
 * @property {'₹' | '₹₹' | '₹₹₹'} priceRange - Price tier
 * @property {number} rating - Rating (1.0 - 5.0)
 * @property {number} reviewCount - Review count
 * @property {'available' | 'request' | 'unavailable'} availability - Availability
 * @property {boolean} verified - Verified venue badge
 * @property {string[]} facilities - List of available amenities
 * @property {string} description - Venue description
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} Ceremony
 * @property {string | number} id - Unique ceremony identifier
 * @property {string} name - Traditional ceremony name
 * @property {string} nameEnglish - English equivalent
 * @property {string} description - Overview of significance
 * @property {string} tradition - Tradition / school of practice
 * @property {string} [region] - Regional tradition
 * @property {string[]} [typicalMaterials] - Recommended puja materials
 * @property {string} [duration] - Typical duration
 */

/**
 * @typedef {Object} BookingHold
 * @property {string} bookingId - Unique booking ID
 * @property {string} userId - User UID
 * @property {string} ceremonyType - Type of ceremony
 * @property {string} date - Requested ceremony date (YYYY-MM-DD)
 * @property {string} location - Location name
 * @property {string} [guestCount] - Approximate guest count
 * @property {Priest} [selectedPriest] - Priest record
 * @property {Venue} [selectedVenue] - Venue record
 * @property {Temple} [selectedTemple] - Temple record
 * @property {number} totalAmount - Backend-calculated trusted amount in INR
 * @property {'HOLD' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'FAILED'} status - Booking state
 * @property {string} holdExpiresAt - ISO timestamp for hold expiry (e.g., 15 mins)
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} PaymentOrder
 * @property {string} orderId - Payment gateway order ID
 * @property {string} bookingId - Associated booking hold ID
 * @property {number} amount - Amount in INR (or paise)
 * @property {string} currency - 'INR'
 * @property {'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'} status - Payment state
 * @property {string} [transactionId] - Gateway transaction ID
 * @property {string} [receiptReference] - Customer receipt reference
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} AIStructuredResponse
 * @property {'CEREMONY_PLANNING' | 'PRIEST_SEARCH' | 'TEMPLE_SEARCH' | 'TEMPLE_POOJA' | 'HALL_SEARCH' | 'RITUAL_GUIDANCE' | 'CHECKLIST' | 'NEARBY_TEMPLE' | 'GENERAL_APPLICATION_HELP' | 'OUT_OF_SCOPE'} intent
 * @property {string} state - Conversational state machine status
 * @property {'ASK_REQUIRED_FIELD' | 'ASK_CLARIFICATION' | 'SEARCH_PRIESTS' | 'SEARCH_TEMPLES' | 'SEARCH_TEMPLE_POOJA' | 'SEARCH_HALLS' | 'SEARCH_CEREMONIES' | 'REQUEST_LOCATION_PERMISSION' | 'SHOW_CHECKLIST' | 'SHOW_CEREMONY_GUIDANCE' | 'SHOW_RESULTS' | 'VIEW_ENTITY' | 'CHECK_AVAILABILITY' | 'START_BOOKING' | 'REVIEW_BOOKING' | 'START_PAYMENT' | 'REVIEW_PAYMENT' | 'EXPLAIN_RESULT' | 'RESET_WORKFLOW' | 'REDIRECT' | 'ESCALATE' | 'NO_ACTION'} action
 * @property {'en' | 'te'} language
 * @property {string} message - User-facing guidance message
 * @property {Object} entities - Extracted ceremony, location, date, guest count, etc.
 * @property {string[]} required_fields - List of required fields for current intent
 * @property {string[]} known_fields - Extracted & confirmed fields
 * @property {string[]} missing_fields - Still missing mandatory fields
 * @property {string} [next_question] - Next question to prompt user
 * @property {number} confidence - Classification confidence (0.0 - 1.0)
 * @property {boolean} requires_backend_data - Whether action requires backend query
 * @property {boolean} requires_location_permission - Whether location access is requested
 * @property {boolean} requires_practitioner_confirmation - Sensitive religious detail flag
 * @property {Object} [backend_action] - Validated payload for backend query
 * @property {Array} [recommendations] - Real database recommendation records
 */

export const Intents = {
  CEREMONY_PLANNING: 'CEREMONY_PLANNING',
  PRIEST_SEARCH: 'PRIEST_SEARCH',
  TEMPLE_SEARCH: 'TEMPLE_SEARCH',
  TEMPLE_POOJA: 'TEMPLE_POOJA',
  HALL_SEARCH: 'HALL_SEARCH',
  RITUAL_GUIDANCE: 'RITUAL_GUIDANCE',
  CHECKLIST: 'CHECKLIST',
  NEARBY_TEMPLE: 'NEARBY_TEMPLE',
  GENERAL_APPLICATION_HELP: 'GENERAL_APPLICATION_HELP',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
};

export const Actions = {
  ASK_REQUIRED_FIELD: 'ASK_REQUIRED_FIELD',
  ASK_CLARIFICATION: 'ASK_CLARIFICATION',
  SEARCH_PRIESTS: 'SEARCH_PRIESTS',
  SEARCH_TEMPLES: 'SEARCH_TEMPLES',
  SEARCH_TEMPLE_POOJA: 'SEARCH_TEMPLE_POOJA',
  SEARCH_HALLS: 'SEARCH_HALLS',
  SEARCH_CEREMONIES: 'SEARCH_CEREMONIES',
  REQUEST_LOCATION_PERMISSION: 'REQUEST_LOCATION_PERMISSION',
  SHOW_CHECKLIST: 'SHOW_CHECKLIST',
  SHOW_CEREMONY_GUIDANCE: 'SHOW_CEREMONY_GUIDANCE',
  SHOW_RESULTS: 'SHOW_RESULTS',
  VIEW_ENTITY: 'VIEW_ENTITY',
  CHECK_AVAILABILITY: 'CHECK_AVAILABILITY',
  START_BOOKING: 'START_BOOKING',
  REVIEW_BOOKING: 'REVIEW_BOOKING',
  START_PAYMENT: 'START_PAYMENT',
  REVIEW_PAYMENT: 'REVIEW_PAYMENT',
  EXPLAIN_RESULT: 'EXPLAIN_RESULT',
  RESET_WORKFLOW: 'RESET_WORKFLOW',
  REDIRECT: 'REDIRECT',
  ESCALATE: 'ESCALATE',
  NO_ACTION: 'NO_ACTION',
};
