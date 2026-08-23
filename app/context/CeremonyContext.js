'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  // Location
  location: {
    name: 'Hyderabad, Telangana',
    area: 'Gachibowli',
    lat: 17.4401,
    lng: 78.3489,
  },

  // Active category
  selectedCategory: 'venues', // 'priests' | 'temples' | 'venues'

  // Ceremony details
  ceremonyType: '',
  date: '',
  language: '',
  guestCount: '',
  budget: '',

  // Selected services
  selectedVenue: null,
  selectedPriest: null,
  selectedTemple: null,

  // Ceremony plan items
  ceremonyPlan: [],

  // Search / filter
  searchRadius: 5, // km
  sortBy: 'recommended',
  filters: {
    price: '',
    capacity: '',
    facilities: [],
    languages: [],
    availability: 'all',
    rating: '',
    templeServices: [],
  },

  // AI planner
  aiQuery: '',
  aiResults: null,

  // UI state
  isDrawerOpen: false,
  isFilterOpen: false,
  isMapExpanded: false,
  isLocationModalOpen: false,
};

function ceremonyReducer(state, action) {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: { ...state.location, ...action.payload } };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_CEREMONY_TYPE':
      return { ...state, ceremonyType: action.payload };

    case 'SET_DATE':
      return { ...state, date: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.payload };

    case 'SET_BUDGET':
      return { ...state, budget: action.payload };

    case 'SET_SEARCH_RADIUS':
      return { ...state, searchRadius: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'SELECT_VENUE':
      return {
        ...state,
        selectedVenue: action.payload,
        ceremonyPlan: updatePlan(state.ceremonyPlan, 'venue', action.payload),
      };

    case 'SELECT_PRIEST':
      return {
        ...state,
        selectedPriest: action.payload,
        ceremonyPlan: updatePlan(state.ceremonyPlan, 'priest', action.payload),
      };

    case 'SELECT_TEMPLE':
      return {
        ...state,
        selectedTemple: action.payload,
        ceremonyPlan: updatePlan(state.ceremonyPlan, 'temple', action.payload),
      };

    case 'ADD_TO_CEREMONY': {
      const exists = state.ceremonyPlan.find(
        (item) => item.id === action.payload.id && item.type === action.payload.type
      );
      if (exists) return state;
      const newPlan = [...state.ceremonyPlan, action.payload];
      const updates = {};
      if (action.payload.type === 'venue') updates.selectedVenue = action.payload;
      if (action.payload.type === 'priest') updates.selectedPriest = action.payload;
      if (action.payload.type === 'temple') updates.selectedTemple = action.payload;
      return { ...state, ceremonyPlan: newPlan, ...updates };
    }

    case 'REMOVE_FROM_CEREMONY': {
      const filtered = state.ceremonyPlan.filter(
        (item) => !(item.id === action.payload.id && item.type === action.payload.type)
      );
      const updates = {};
      if (action.payload.type === 'venue') updates.selectedVenue = null;
      if (action.payload.type === 'priest') updates.selectedPriest = null;
      if (action.payload.type === 'temple') updates.selectedTemple = null;
      return { ...state, ceremonyPlan: filtered, ...updates };
    }

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          price: '',
          capacity: '',
          facilities: [],
          languages: [],
          availability: 'all',
          rating: '',
          templeServices: [],
        },
      };

    case 'SET_AI_QUERY':
      return { ...state, aiQuery: action.payload };

    case 'SET_AI_RESULTS':
      return { ...state, aiResults: action.payload };

    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    case 'TOGGLE_FILTER':
      return { ...state, isFilterOpen: !state.isFilterOpen };

    case 'TOGGLE_MAP':
      return { ...state, isMapExpanded: !state.isMapExpanded };

    case 'TOGGLE_LOCATION_MODAL':
      return { ...state, isLocationModalOpen: !state.isLocationModalOpen };

    case 'RESET_PLAN':
      return {
        ...state,
        selectedVenue: null,
        selectedPriest: null,
        selectedTemple: null,
        ceremonyPlan: [],
        ceremonyType: '',
        date: '',
        language: '',
        guestCount: '',
        budget: '',
      };

    default:
      return state;
  }
}

function updatePlan(plan, type, item) {
  const filtered = plan.filter((p) => p.type !== type);
  if (item) {
    return [...filtered, { ...item, type }];
  }
  return filtered;
}

const CeremonyContext = createContext(null);

export function CeremonyProvider({ children }) {
  const [state, dispatch] = useReducer(ceremonyReducer, initialState);

  const actions = {
    setLocation: useCallback((loc) => dispatch({ type: 'SET_LOCATION', payload: loc }), []),
    setCategory: useCallback((cat) => dispatch({ type: 'SET_CATEGORY', payload: cat }), []),
    setCeremonyType: useCallback((t) => dispatch({ type: 'SET_CEREMONY_TYPE', payload: t }), []),
    setDate: useCallback((d) => dispatch({ type: 'SET_DATE', payload: d }), []),
    setLanguage: useCallback((l) => dispatch({ type: 'SET_LANGUAGE', payload: l }), []),
    setGuestCount: useCallback((g) => dispatch({ type: 'SET_GUEST_COUNT', payload: g }), []),
    setBudget: useCallback((b) => dispatch({ type: 'SET_BUDGET', payload: b }), []),
    setSearchRadius: useCallback((r) => dispatch({ type: 'SET_SEARCH_RADIUS', payload: r }), []),
    setSortBy: useCallback((s) => dispatch({ type: 'SET_SORT_BY', payload: s }), []),
    setFilters: useCallback((f) => dispatch({ type: 'SET_FILTERS', payload: f }), []),
    clearFilters: useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), []),
    selectVenue: useCallback((v) => dispatch({ type: 'SELECT_VENUE', payload: v }), []),
    selectPriest: useCallback((p) => dispatch({ type: 'SELECT_PRIEST', payload: p }), []),
    selectTemple: useCallback((t) => dispatch({ type: 'SELECT_TEMPLE', payload: t }), []),
    addToCeremony: useCallback((item) => dispatch({ type: 'ADD_TO_CEREMONY', payload: item }), []),
    removeFromCeremony: useCallback((item) => dispatch({ type: 'REMOVE_FROM_CEREMONY', payload: item }), []),
    setAiQuery: useCallback((q) => dispatch({ type: 'SET_AI_QUERY', payload: q }), []),
    setAiResults: useCallback((r) => dispatch({ type: 'SET_AI_RESULTS', payload: r }), []),
    toggleDrawer: useCallback(() => dispatch({ type: 'TOGGLE_DRAWER' }), []),
    toggleFilter: useCallback(() => dispatch({ type: 'TOGGLE_FILTER' }), []),
    toggleMap: useCallback(() => dispatch({ type: 'TOGGLE_MAP' }), []),
    toggleLocationModal: useCallback(() => dispatch({ type: 'TOGGLE_LOCATION_MODAL' }), []),
    resetPlan: useCallback(() => dispatch({ type: 'RESET_PLAN' }), []),
  };

  return (
    <CeremonyContext.Provider value={{ ...state, ...actions }}>
      {children}
    </CeremonyContext.Provider>
  );
}

export function useCeremony() {
  const context = useContext(CeremonyContext);
  if (!context) {
    throw new Error('useCeremony must be used within a CeremonyProvider');
  }
  return context;
}
