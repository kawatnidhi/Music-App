const db = require('../services/dbService');
const YouTubeService = require('../services/youtubeService');

class SongController {
  // GET /api/songs
  static async getAll(req, res) {
    try {
      const { category, search, featured } = req.query;
      const songs = db.getAllSongs({ category, search, featuredOnly: featured === 'true' });
      const enriched = songs.map(s => ({ ...s, isFavorite: db.isFavorite(s.id) }));
      return res.json({ success: true, count: enriched.length, songs: enriched });
    } catch (err) {
      console.error('Error fetching songs:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/songs/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const song = db.getSongById(id) || db.getSongByVideoId(id);
      if (!song) return res.status(404).json({ success: false, error: 'Song not found' });
      return res.json({ success: true, song: { ...song, isFavorite: db.isFavorite(song.id) } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/songs/categories
  static async getCategories(req, res) {
    try {
      return res.json({ success: true, categories: db.data.categories });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/songs/stream/:id
  // This is the CORE of the ad-free engine.
  // It proxies audio bytes from YouTube CDN through our server to avoid CORS.
  // The browser <audio> element connects to OUR server, and WE fetch from Google.
  static async streamAudio(req, res) {
    try {
      const { id } = req.params;
      let song = db.getSongById(id) || db.getSongByVideoId(id);
      let videoId = song?.videoId || id;

      if (song) {
        db.incrementPlays(song.id);
      }

      // 1. If song has a direct external audio URL (not YouTube), redirect to it
      if (song && song.sourceType === 'direct_audio' && song.streamUrl && song.streamUrl.startsWith('http')) {
        return res.redirect(song.streamUrl);
      }

      // 2. For YouTube songs: PROXY the audio stream (not redirect)
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return await YouTubeService.proxyAudioStream(videoId, req, res);
      }

      // 3. Fallback
      return res.redirect(YouTubeService.getFallbackAudio());
    } catch (err) {
      console.error('Audio stream handler error:', err);
      if (!res.headersSent) {
        return res.redirect(YouTubeService.getFallbackAudio());
      }
    }
  }

  // GET /api/songs/history
  static async getHistory(req, res) {
    try {
      const historySongs = db.data.history
        .map(id => db.getSongById(id))
        .filter(Boolean)
        .map(s => ({ ...s, isFavorite: db.isFavorite(s.id) }));
      return res.json({ success: true, history: historySongs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = SongController;
