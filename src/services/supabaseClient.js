import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smnjhriwbrfpvdfiiapo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbmpocml3YnJmcHZkZmlpYXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjIzNjAsImV4cCI6MjA5ODA5ODM2MH0.K4bBhJhRjeqCDl2i5XT2oMBpcJjZfVvZnl5eaWQqqhQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Obtiene el ranking de jugadores desde Supabase.
 * Devuelve null si ocurre un error, indicando al llamador que use localStorage de respaldo.
 */
export async function getSupabaseLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('jugador')
      .select('*')
      .order('pts', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase select error:', error);
      return null;
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
    return null;
  }
}

/**
 * Guarda o actualiza la puntuación de un jugador en Supabase.
 */
export async function saveSupabaseScore(tag, pts) {
  try {
    // Buscamos si ya existe el jugador con el mismo tag (insensible a mayúsculas/minúsculas si es posible, o filtrado exacto)
    const { data: existing, error: selectError } = await supabase
      .from('jugador')
      .select('*')
      .eq('tag', tag);

    if (selectError) {
      throw selectError;
    }

    const player = existing && existing.length > 0 ? existing[0] : null;

    if (player) {
      const newPts = (player.pts || 0) + pts;
      const newGames = (player.games || 1) + 1;
      
      const { error: updateError } = await supabase
        .from('jugador')
        .update({ pts: newPts, games: newGames })
        .eq('id', player.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('jugador')
        .insert([{ tag, pts, games: 1 }]);

      if (insertError) throw insertError;
    }
    return true;
  } catch (err) {
    console.error('Error saving score to Supabase:', err);
    return false;
  }
}
