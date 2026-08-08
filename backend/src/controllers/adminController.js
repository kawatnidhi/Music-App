const db = require('../services/dbService');
const YouTubeService = require('../services/youtubeService');

class AdminController {
  // POST /api/admin/extract
  // Extracts music photo/thumbnail, song title, artist, duration from YouTube / music URL
  static async extractMetadata(req, res) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
      }

      const metadata = await YouTubeService.extractMetadata(url);

      // Check if song already exists in catalog
      const existing = metadata.videoId ? db.getSongByVideoId(metadata.videoId) : null;

      return res.json({
        success: true,
        data: {
          ...metadata,
          alreadyInCatalog: Boolean(existing),
          existingId: existing?.id || null
        }
      });
    } catch (err) {
      console.error('Extraction error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/admin/songs
  // Saves a new song with the uploaded link, high-res artwork, and metadata
  static async createSong(req, res) {
    try {
      const {
        title,
        artist,
        album,
        category,
        url,
        thumbnail,
        duration,
        durationFormatted,
        isFeatured,
        sourceType
      } = req.body;

      if (!title || !url) {
        return res.status(400).json({ success: false, error: 'Title and URL are required' });
      }

      // Extract video ID if YouTube
      const videoId = YouTubeService.extractVideoId(url);

      // Duplicate check: prevent uploading the same YouTube video twice
      if (videoId) {
        const existing = db.getSongByVideoId(videoId);
        if (existing) {
          return res.status(409).json({
            success: false,
            error: `This track is already in your catalog as "${existing.title}"`,
            existingId: existing.id
          });
        }
      }

      const songThumbnail = thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80');

      const newSong = db.addSong({
        title,
        artist: artist || 'Various Artists',
        album: album || 'Single',
        category: category || 'Trending',
        originalUrl: url,
        thumbnail: songThumbnail,
        fallbackThumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : songThumbnail,
        duration: parseInt(duration) || 180,
        durationFormatted: durationFormatted || '3:00',
        sourceType: sourceType || (videoId ? 'youtube' : 'direct_audio'),
        videoId,
        // streamUrl always points to our proxy endpoint, never a raw CDN URL
        streamUrl: videoId ? `/api/songs/stream/${videoId}` : url,
        isFeatured: Boolean(isFeatured)
      });

      return res.status(201).json({
        success: true,
        message: 'Track published successfully to music app',
        song: newSong
      });
    } catch (err) {
      console.error('Create song error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PUT /api/admin/songs/:id
  static async updateSong(req, res) {
    try {
      const { id } = req.params;
      const updated = db.updateSong(id, req.body);

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Song not found' });
      }

      return res.json({
        success: true,
        message: 'Song updated successfully',
        song: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE /api/admin/songs/:id
  static async deleteSong(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.deleteSong(id);

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Song not found' });
      }

      return res.json({
        success: true,
        message: 'Song deleted from catalog'
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/admin/stats
  static async getStats(req, res) {
    try {
      const stats = db.getAdminStats();
      return res.json({
        success: true,
        stats
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = AdminController;
