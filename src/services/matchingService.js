/**
 * Cloud-Based Lost & Found Matching Algorithm
 * Calculates similarity between a Lost item and a Found item.
 * 
 * Scoring Formula (Max 100 Points):
 * - Category match: 20 points
 * - Item name similarity: 30 points
 * - Color match: 15 points
 * - Location match: 20 points
 * - Date proximity: 15 points
 * 
 * Threshold: >= 70% is classified as a "Possible Match Found"
 */

// Simple text tokenization helper
function getCleanWords(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// Compute string similarity based on shared keywords
function calculateNameScore(nameA = "", nameB = "") {
  const normA = nameA.toLowerCase().trim();
  const normB = nameB.toLowerCase().trim();

  // Exact or contains match
  if (normA === normB) return 30;
  if (normA.includes(normB) || normB.includes(normA)) return 26;

  const wordsA = getCleanWords(normA);
  const wordsB = getCleanWords(normB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  let sharedCount = 0;
  for (const w of wordsA) {
    if (wordsB.some(b => b === w || b.includes(w) || w.includes(b))) {
      sharedCount++;
    }
  }

  const ratio = sharedCount / Math.max(wordsA.length, wordsB.length);
  return Math.round(ratio * 30);
}

// Calculate Date Proximity Score (Max 15 points)
function calculateDateScore(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return 8; // neutral partial

  const d1 = new Date(dateStrA).getTime();
  const d2 = new Date(dateStrB).getTime();

  if (isNaN(d1) || isNaN(d2)) return 8;

  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) return 15; // Same or adjacent day
  if (diffDays <= 3) return 12; // Within 3 days
  if (diffDays <= 7) return 8;  // Within a week
  if (diffDays <= 14) return 4; // Within two weeks
  return 0;                     // Far apart
}

export function evaluateMatchPair(itemA, itemB) {
  // Ensure we are comparing a Lost item and a Found item (or vice versa)
  const isOppositeTypes = 
    (itemA.type?.toLowerCase() === "lost" && itemB.type?.toLowerCase() === "found") ||
    (itemA.type?.toLowerCase() === "found" && itemB.type?.toLowerCase() === "lost");

  if (!isOppositeTypes) {
    return {
      isMatch: false,
      score: 0,
      breakdown: { category: 0, name: 0, color: 0, location: 0, date: 0 }
    };
  }

  // 1. Category Match (20 points)
  const catA = (itemA.category || "").trim().toLowerCase();
  const catB = (itemB.category || "").trim().toLowerCase();
  const categoryScore = (catA && catB && catA === catB) ? 20 : 0;

  // 2. Item Name Match (30 points)
  const nameScore = calculateNameScore(itemA.itemName, itemB.itemName);

  // 3. Color Match (15 points)
  const colorA = (itemA.color || "").trim().toLowerCase();
  const colorB = (itemB.color || "").trim().toLowerCase();
  let colorScore = 0;
  if (colorA && colorB) {
    if (colorA === colorB) {
      colorScore = 15;
    } else if (colorA.includes(colorB) || colorB.includes(colorA)) {
      colorScore = 10;
    }
  }

  // 4. Location Match (20 points)
  const locA = (itemA.location || "").trim().toLowerCase();
  const locB = (itemB.location || "").trim().toLowerCase();
  let locationScore = 0;
  if (locA && locB) {
    if (locA === locB) {
      locationScore = 20;
    } else if (locA.includes(locB) || locB.includes(locA)) {
      locationScore = 15;
    }
  }

  // 5. Date Similarity (15 points)
  const dateScore = calculateDateScore(itemA.date, itemB.date);

  const totalScore = categoryScore + nameScore + colorScore + locationScore + dateScore;
  const isMatch = totalScore >= 70; // 70% threshold as per project guidelines

  return {
    isMatch,
    score: Math.min(100, totalScore),
    breakdown: {
      category: categoryScore, // max 20
      name: nameScore,         // max 30
      color: colorScore,       // max 15
      location: locationScore, // max 20
      date: dateScore          // max 15
    }
  };
}

/**
 * Scan all items to find candidate matches for a given item.
 */
export function findPotentialMatches(targetItem, allItems = []) {
  if (!targetItem || !allItems.length) return [];
  // A resolved report is closed: it should not surface new matches anywhere
  // (cards, spotlight, detail modal or My Reports).
  if (targetItem.status === "Returned") return [];

  const matches = [];

  for (const item of allItems) {
    if (item.id === targetItem.id) continue;
    // Don't match with returned items
    if (item.status === "Returned") continue;

    const evaluation = evaluateMatchPair(targetItem, item);
    if (evaluation.isMatch || evaluation.score >= 50) {
      matches.push({
        matchedItem: item,
        score: evaluation.score,
        isHighConfidence: evaluation.isMatch,
        breakdown: evaluation.breakdown
      });
    }
  }

  // Sort descending by match score
  return matches.sort((a, b) => b.score - a.score);
}
