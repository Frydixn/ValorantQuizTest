export const RANKS = [
  { name: 'Hierro', min: 0, color: '#8a8f96' },
  { name: 'Bronce', min: 500, color: '#b87333' },
  { name: 'Plata', min: 1200, color: '#a8b2bd' },
  { name: 'Oro', min: 2500, color: '#e8c84a' },
  { name: 'Platino', min: 4500, color: '#47c9a2' },
  { name: 'Diamante', min: 7500, color: '#8b5cf6' },
  { name: 'Ascendente', min: 12000, color: '#22d3ee' },
  { name: 'Inmortal', min: 18000, color: '#ef4444' },
  { name: 'Radiante', min: 27000, color: '#ffd700' },
];

export function getRank(pts) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (pts >= r.min) {
      rank = r;
    } else {
      break;
    }
  }
  return rank;
}

export function getNextRank(pts) {
  for (const r of RANKS) {
    if (pts < r.min) return r;
  }
  return null;
}

export function rankProgress(pts) {
  const rank = getRank(pts);
  const next = getNextRank(pts);
  if (!next) return 100;
  return Math.round(((pts - rank.min) / (next.min - rank.min)) * 100);
}
