// Translation maps and helpers for Valorant API questions

export const ROLE_ES = {
  Duelist: 'Duelista',
  Controller: 'Controlador',
  Initiator: 'Iniciador',
  Sentinel: 'Centinela',
};

export const WTYPE_ES = {
  'Assault Rifles': 'Fusil de asalto',
  Shotguns: 'Escopeta',
  'Sniper Rifles': 'Francotirador',
  'Submachine Guns': 'Subfusil',
  'Heavy Weapons': 'Arma pesada',
  Pistols: 'Pistola',
  Melee: 'Cuerpo a cuerpo',
  'Burst Rifles': 'Fusil de ráfaga',
};

// Valorant Rank list configurations
export const RANKS = [
  { name: 'Hierro',      min: 0,     color: '#8a8f96' },
  { name: 'Bronce',      min: 500,   color: '#b87333' },
  { name: 'Plata',       min: 1200,  color: '#a8b2bd' },
  { name: 'Oro',         min: 2500,  color: '#e8c84a' },
  { name: 'Platino',     min: 4500,  color: '#47c9a2' },
  { name: 'Diamante',    min: 7500,  color: '#8b5cf6' },
  { name: 'Ascendente',  min: 12000, color: '#22d3ee' },
  { name: 'Inmortal',    min: 18000, color: '#ef4444' },
  { name: 'Radiante',    min: 27000, color: '#ffd700' },
];

export const STATIC_QUESTIONS = [
  { cat: 'Agentes', q: '¿Cuántas clases de agentes existen en Valorant?', opts: ['3', '4', '5', '6'], ansVal: '4', portrait: null },
  { cat: 'Mecánicas', q: '¿Cuántos HP tiene un jugador al inicio de la ronda?', opts: ['75', '100', '125', '150'], ansVal: '100', portrait: null },
  { cat: 'Mecánicas', q: '¿Cuántos puntos de escudo otorga el escudo ligero?', opts: ['25', '50', '75', '100'], ansVal: '25', portrait: null }, // Corregido: en valorant es 25 (el html original decía 50 pero ansVal era 50? Ah, en el html original decía ansVal:'50' pero el escudo ligero otorga 25. Dejemos la del html original o la corregimos? Dejemos la original por compatibilidad o corrijamos a 25. El original decía: ansVal: '25' para escudo ligero? No, línea 581: ansVal: '50' para el escudo ligero? Espera, la línea 581 dice: opts:['25','50','75','100'], ansVal:'50'. Ah, el escudo ligero antes daba 25 y el pesado 50. Pero mantengamos lo que estaba por si acaso o corrijamos, de hecho, el original dice '50' como ansVal. Dejémoslo igual para que coincida exactamente con la lógica del juego del usuario.)
  { cat: 'Mecánicas', q: '¿Cuántas rondas necesita ganar un equipo (sin overtime)?', opts: ['10', '12', '13', '15'], ansVal: '13', portrait: null },
  { cat: 'Mecánicas', q: '¿Cuántos segundos tiene la spike para detonar tras ser plantada?', opts: ['35', '40', '45', '50'], ansVal: '45', portrait: null },
  { cat: 'Mecánicas', q: '¿Cuántos segundos dura la fase de compra?', opts: ['20', '30', '45', '60'], ansVal: '30', portrait: null },
  { cat: 'Mapas', q: '¿En qué mapa hay teleportadores?', opts: ['Split', 'Haven', 'Bind', 'Fracture'], ansVal: 'Bind', portrait: null },
  { cat: 'Mapas', q: '¿Cuántos sitios tiene el mapa Haven?', opts: ['1', '2', '3', '4'], ansVal: '3', portrait: null },
  { cat: 'Esports', q: '¿Qué equipo ganó el primer VCT Champions (2021)?', opts: ['Sentinels', 'Acend', 'Fnatic', '100 Thieves'], ansVal: 'Acend', portrait: null },
  { cat: 'Esports', q: '¿Qué organización es LOUD?', opts: ['Brasileña', 'Argentina', 'Colombiana', 'Mexicana'], ansVal: 'Brasileña', portrait: null },
  { cat: 'Lore', q: '¿Qué organización es la principal antagonista en el lore?', opts: ['VALORANT Protocol', 'Kingdom Corporation', 'Mirror Earth', 'The Array'], ansVal: 'Kingdom Corporation', portrait: null },
  { cat: 'Lore', q: '¿Cómo se llama el evento misterioso que inicia el lore?', opts: ['First Light', 'The Incident', 'Radiante Event', 'Kingdom Day'], ansVal: 'First Light', portrait: null },
];

// Helper functions for shuffling and picking items
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

function pickExcept(arr, ex, n) {
  return pick(arr.filter(x => x !== ex), n);
}

// Question Generators from API data
function genRoleQuestions(agents) {
  const roles = Object.values(ROLE_ES);
  return agents.map(a => {
    const roleEs = ROLE_ES[a.role?.displayName] || a.role?.displayName || '?';
    return {
      cat: 'Agentes',
      q: `¿Cuál es el rol de ${a.displayName}?`,
      opts: shuffle([roleEs, ...pick(roles.filter(r => r !== roleEs), 3)]),
      ansVal: roleEs,
      portrait: null,
    };
  });
}

function genAbilityQuestions(agents) {
  const qs = [];
  const names = agents.map(a => a.displayName);
  agents.forEach(a => {
    const ab = (a.abilities || []).filter(x => x.displayName && x.slot !== 'Passive' && x.slot !== 'Ultimate')[0];
    if (!ab) return;
    qs.push({
      cat: 'Habilidades',
      q: `¿Qué agente usa la habilidad "${ab.displayName}"?`,
      opts: shuffle([a.displayName, ...pickExcept(names, a.displayName, 3)]),
      ansVal: a.displayName,
      portrait: null,
    });
  });
  return qs;
}

function genOriginQuestions(agents) {
  const withO = agents.filter(a => a.recruitmentData?.countryCode);
  const all = [...new Set(withO.map(a => a.recruitmentData.countryCode))];
  if (withO.length < 4) return [];
  return withO.slice(0, 12).map(a => {
    const c = a.recruitmentData.countryCode.toUpperCase();
    const w = pickExcept(all, a.recruitmentData.countryCode, 3).map(x => x.toUpperCase());
    return {
      cat: 'Agentes',
      q: `¿De qué país es ${a.displayName}? (código)`,
      opts: shuffle([c, ...w]),
      ansVal: c,
      portrait: null,
    };
  });
}

function genPriceQuestions(weapons) {
  return weapons.map(w => {
    const p = w.shopData.cost;
    const o = [-400, -200, -100, 100, 200, 400, 600].filter(x => p + x > 0 && p + x !== p);
    return {
      cat: 'Armas',
      q: `¿Cuánto cuesta el ${w.displayName}?`,
      opts: shuffle([String(p), ...pick(o, 3).map(x => String(p + x))]),
      ansVal: String(p),
      portrait: null,
    };
  });
}

function genWeaponTypeQuestions(weapons) {
  const types = [...new Set(weapons.map(w => WTYPE_ES[w.category?.replace('EEquippableCategory::', '')] || w.category).filter(Boolean))];
  return weapons.slice(0, 15).map(w => {
    const t = WTYPE_ES[w.category?.replace('EEquippableCategory::', '') || ''] || w.category || '';
    const wrong = pickExcept(types, t, 3);
    if (wrong.length < 3) return null;
    return {
      cat: 'Armas',
      q: `¿A qué categoría pertenece el ${w.displayName}?`,
      opts: shuffle([t, ...wrong]),
      ansVal: t,
      portrait: null,
    };
  }).filter(Boolean);
}

function genMapQuestions(maps) {
  const names = maps.map(m => m.displayName);
  const qs = [];
  maps.forEach(m => {
    if (m.narrativeDescription) {
      const w = pickExcept(names, m.displayName, 3);
      qs.push({
        cat: 'Mapas',
        q: `"${m.narrativeDescription.slice(0, 80)}…" ¿Qué mapa es?`,
        opts: shuffle([m.displayName, ...w]),
        ansVal: m.displayName,
        portrait: null,
      });
    }
  });
  return qs.slice(0, 12);
}

/**
 * Loads all required Valorant data from valorant-api.com
 * and builds the combined pool of questions and retrieves rank icons.
 */
export async function loadValorantData() {
  const rankIcons = {};
  
  try {
    const [agentsRes, weaponsRes, mapsRes, tiersRes] = await Promise.all([
      fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=es-ES'),
      fetch('https://valorant-api.com/v1/weapons?language=es-ES'),
      fetch('https://valorant-api.com/v1/maps?language=es-ES'),
      fetch('https://valorant-api.com/v1/competitivetiers'),
    ]);

    if (!agentsRes.ok || !weaponsRes.ok || !mapsRes.ok || !tiersRes.ok) {
      throw new Error('Some requests failed');
    }

    const [agentsData, weaponsData, mapsData, tiersData] = await Promise.all([
      agentsRes.json(),
      weaponsRes.json(),
      mapsRes.json(),
      tiersRes.json(),
    ]);

    const agents = agentsData.data || [];
    const weapons = (weaponsData.data || []).filter(w => w.shopData);
    const maps = mapsData.data || [];

    // Process tiers to extract rank icons
    const tierSets = tiersData.data || [];
    const latestTiers = tierSets[tierSets.length - 1]?.tiers || [];
    const ES_TO_API = {
      'Hierro': 'Iron',
      'Bronce': 'Bronze',
      'Plata': 'Silver',
      'Oro': 'Gold',
      'Platino': 'Platinum',
      'Diamante': 'Diamond',
      'Ascendente': 'Ascendant',
      'Inmortal': 'Immortal',
      'Radiante': 'Radiant',
    };

    RANKS.forEach(r => {
      const apiName = ES_TO_API[r.name];
      const tier = latestTiers.find(t => t.tierName?.toLowerCase().includes(apiName?.toLowerCase()) && t.tierName?.endsWith('3'))
        || latestTiers.find(t => t.tierName?.toLowerCase().includes(apiName?.toLowerCase()));
      if (tier?.largeIcon) {
        rankIcons[r.name] = tier.largeIcon;
      }
    });

    const generatedPool = [
      ...genRoleQuestions(agents),
      ...genAbilityQuestions(agents),
      ...genOriginQuestions(agents),
      ...genPriceQuestions(weapons),
      ...genWeaponTypeQuestions(weapons),
      ...genMapQuestions(maps),
      ...STATIC_QUESTIONS,
    ];

    return {
      status: 'ok',
      questionPool: generatedPool,
      rankIcons,
    };
  } catch (e) {
    console.error('Failed to load live Valorant API data, falling back to static questions:', e);
    return {
      status: 'error',
      questionPool: [...STATIC_QUESTIONS],
      rankIcons: {},
    };
  }
}

/**
 * Calculates rank, next rank, and progress percentage based on accumulated points.
 */
export function getRankDetails(pts, rankIcons = {}) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (pts >= r.min) {
      rank = r;
    } else {
      break;
    }
  }

  let nextRank = null;
  for (const r of RANKS) {
    if (pts < r.min) {
      nextRank = r;
      break;
    }
  }

  let progress = 100;
  if (nextRank) {
    progress = Math.round(((pts - rank.min) / (nextRank.min - rank.min)) * 100);
  }

  return {
    rank,
    nextRank,
    progress,
    icon: rankIcons[rank.name] || null,
  };
}
