export function loadLB() {
  try {
    return JSON.parse(localStorage.getItem('valoquiz_lb') || '[]');
  } catch {
    return [];
  }
}

export function saveLB(lb) {
  localStorage.setItem('valoquiz_lb', JSON.stringify(lb));
}

export function addScore(tag, pts) {
  const lb = loadLB();
  const existing = lb.find(e => e.tag.toLowerCase() === tag.toLowerCase());
  if (existing) {
    existing.pts += pts;
    existing.games = (existing.games || 1) + 1;
  } else {
    lb.push({ tag, pts, games: 1 });
  }
  lb.sort((a, b) => b.pts - a.pts);
  const trimmed = lb.slice(0, 50);
  saveLB(trimmed);
  return trimmed;
}

export function getPlayerPts(tag) {
  const lb = loadLB();
  const e = lb.find(e => e.tag.toLowerCase() === tag.toLowerCase());
  return e ? e.pts : 0;
}

export function clearLB() {
  localStorage.removeItem('valoquiz_lb');
  return [];
}
