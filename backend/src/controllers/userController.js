const db = require('../services/dbService');

class UserController {
  // GET /api/favorites
  static async getFavorites(req, res) {
    try {
      const favorites = db.getFavoriteSongs().map(s => ({
        ...s,
        isFavorite: true
      }));

      return res.json({
        success: true,
        count: favorites.length,
        favorites
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/favorites/toggle
  static async toggleFavorite(req, res) {
    try {
      const { songId } = req.body;
      if (!songId) {
        return res.status(400).json({ success: false, error: 'Song ID is required' });
      }

      const result = db.toggleFavorite(songId);
      if (result.error) {
        return res.status(404).json({ success: false, error: result.error });
      }

      return res.json({
        success: true,
        isFavorite: result.isFavorite,
        songId: result.songId,
        totalLikes: result.totalLikes
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/playlists
  static async getPlaylists(req, res) {
    try {
      const playlists = db.getAllPlaylists();
      return res.json({
        success: true,
        count: playlists.length,
        playlists
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/playlists
  static async createPlaylist(req, res) {
    try {
      const { title, description, thumbnail } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, error: 'Playlist title is required' });
      }

      const playlist = db.createPlaylist(title, description, thumbnail);
      return res.status(201).json({
        success: true,
        playlist
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/playlists/:id/add
  static async addTrackToPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { songId } = req.body;

      if (!songId) {
        return res.status(400).json({ success: false, error: 'Song ID is required' });
      }

      const success = db.addSongToPlaylist(id, songId);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Playlist not found' });
      }

      return res.json({
        success: true,
        message: 'Song added to playlist'
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/user/profile
  static async getProfile(req, res) {
    try {
      const profile = db.getUserProfile();
      return res.json({
        success: true,
        profile
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PUT /api/user/profile
  static async updateProfile(req, res) {
    try {
      const updated = db.updateUserProfile(req.body);
      return res.json({
        success: true,
        profile: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = UserController;
