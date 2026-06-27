import { supabase } from './supabaseClient';

export async function loadLB() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('pts', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error cargando ranking de Supabase:', e);
    return [];
  }
}

export async function addScore(tag, pts) {
  try {
    // Intentar buscar al jugador (case-insensitive)
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .ilike('tag', tag);
    if (error) throw error;

    if (data && data.length > 0) {
      const existing = data[0];
      const { error: updError } = await supabase
        .from('leaderboard')
        .update({
          pts: existing.pts + pts,
          games: (existing.games || 1) + 1,
        })
        .eq('id', existing.id);
      if (updError) throw updError;
    } else {
      const { error: insError } = await supabase
        .from('leaderboard')
        .insert({
          tag,
          pts,
          games: 1,
        });
      if (insError) throw insError;
    }
    return await loadLB();
  } catch (e) {
    console.error('Error guardando puntuación en Supabase:', e);
    return await loadLB();
  }
}

export async function getPlayerPts(tag) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('pts')
      .ilike('tag', tag);
    if (error) throw error;
    return data && data.length > 0 ? data[0].pts : 0;
  } catch (e) {
    console.error('Error leyendo puntuación de Supabase:', e);
    return 0;
  }
}

export async function clearLB() {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .delete()
      .gte('pts', 0); // Borra todo registro con pts >= 0
    if (error) throw error;
    return [];
  } catch (e) {
    console.error('Error limpiando ranking en Supabase:', e);
    return [];
  }
}
