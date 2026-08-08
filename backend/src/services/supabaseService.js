const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url') {
      try {
        this.client = createClient(supabaseUrl, supabaseKey);
        this.isConfigured = true;
        console.log(`⚡ Connected to Supabase Cloud Database (${supabaseUrl})`);
      } catch (err) {
        console.warn('Supabase initialization notice:', err.message);
      }
    } else {
      console.log('ℹ️ Using Local Database Engine (Set SUPABASE_URL & SUPABASE_ANON_KEY in .env for Cloud DB)');
    }
  }

  // Fetch all songs from Supabase
  async getSongsFromCloud(filter = {}) {
    if (!this.isConfigured) return null;
    try {
      let query = this.client.from('songs').select('*');
      if (filter.category && filter.category !== 'All' && filter.category !== 'Trending') {
        query = query.ilike('category', filter.category);
      }
      if (filter.featuredOnly) {
        query = query.eq('is_featured', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getSongs notice:', err.message);
      return null;
    }
  }

  // Insert a new song into Supabase
  async saveSongToCloud(song) {
    if (!this.isConfigured) return null;
    try {
      const { data, error } = await this.client.from('songs').insert([
        {
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          category: song.category,
          original_url: song.originalUrl,
          thumbnail: song.thumbnail,
          fallback_thumbnail: song.fallbackThumbnail,
          duration: song.duration,
          duration_formatted: song.durationFormatted,
          source_type: song.sourceType,
          video_id: song.videoId,
          stream_url: song.streamUrl,
          is_featured: song.isFeatured,
          plays: song.plays || 0,
          likes: song.likes || 0
        }
      ]).select();

      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.warn('Supabase saveSong notice:', err.message);
      return null;
    }
  }
}

module.exports = new SupabaseService();
