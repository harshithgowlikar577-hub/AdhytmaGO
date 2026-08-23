/**
 * @file recommendationEngine.js
 * Real Recommendation Engine for AdhyatmaGO
 * Deterministic scoring based on actual provider attributes — ZERO fabricated scores.
 */

import { priests, temples, venues } from '../data/mockData';

/**
 * Calculate match score for a priest based on search criteria
 * @param {Object} priest
 * @param {Object} criteria
 * @returns {{ score: number, reasons: string[] }}
 */
export function calculatePriestMatchScore(priest, criteria = {}) {
  let score = 50; // base score for verified in-database record
  const reasons = [];

  const { ceremony_type, language, location, max_distance = 15 } = criteria;

  // 1. Ceremony Specialization Match (+25)
  if (ceremony_type && priest.specialization) {
    const ceremonyClean = ceremony_type.toLowerCase();
    const matchesSpec = priest.specialization.some(s =>
      s.toLowerCase().includes(ceremonyClean) || ceremonyClean.includes(s.toLowerCase().split(' ')[0])
    );
    if (matchesSpec) {
      score += 25;
      reasons.push(`Specializes in ${ceremony_type}`);
    }
  }

  // 2. Language Match (+15)
  if (language && priest.languages) {
    const langClean = language.toLowerCase();
    const matchesLang = priest.languages.some(l => l.toLowerCase() === langClean);
    if (matchesLang) {
      score += 15;
      reasons.push(`Speaks fluent ${language}`);
    }
  }

  // 3. Proximity / Location Match (+10)
  if (priest.distance !== undefined && priest.distance <= max_distance) {
    if (priest.distance <= 3) {
      score += 10;
      reasons.push(`Very close to your location (${priest.distance} km)`);
    } else if (priest.distance <= 7) {
      score += 6;
      reasons.push(`Within convenient distance (${priest.distance} km)`);
    }
  }

  // 4. Rating & Experience (+10)
  if (priest.rating >= 4.7) {
    score += 6;
    reasons.push(`High family rating (${priest.rating} ★)`);
  }
  if (priest.experience >= 15) {
    score += 4;
    reasons.push(`${priest.experience}+ years Vedic experience`);
  }

  // Cap at 99 to avoid artificial certainty
  const finalScore = Math.min(Math.round(score), 99);
  return { score: finalScore, reasons };
}

/**
 * Get ranked priests with calculated match scores
 */
export function getRankedPriests(criteria = {}) {
  return priests
    .map(p => {
      const { score, reasons } = calculatePriestMatchScore(p, criteria);
      return {
        ...p,
        matchScore: score,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get ranked venues
 */
export function getRankedVenues(criteria = {}) {
  const { guest_count, location } = criteria;
  const guests = parseInt(guest_count, 10) || 0;

  return venues
    .map(v => {
      let score = 60;
      const reasons = [];

      if (guests > 0 && v.capacity >= guests) {
        score += 20;
        reasons.push(`Accommodates up to ${v.capacity} guests`);
      }
      if (v.distance <= 5) {
        score += 10;
        reasons.push(`Nearby location (${v.distance} km)`);
      }
      if (v.rating >= 4.5) {
        score += 10;
        reasons.push(`Highly rated venue (${v.rating} ★)`);
      }

      return {
        ...v,
        matchScore: Math.min(score, 98),
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
