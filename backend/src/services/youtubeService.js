const youtubedl = require('youtube-dl-exec');
const axios = require('axios');

// In-memory cache of resolved audio stream URLs (videoId -> { url, expiresAt })
const streamCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

class YouTubeService {
  /**
   * Extracts clean video ID from any YouTube URL variation
   */
  static extractVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    url = url.trim();

    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  }

  /**
   * Fetches metadata & high-res artwork using oEmbed + youtube-dl-exec for duration
   */
  static async extractMetadata(rawUrl) {
    const videoId = this.extractVideoId(rawUrl);

    if (videoId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const maxResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      const hqThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const mqThumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

      let title = 'YouTube Track';
      let artist = 'Various Artists';
      let durationSeconds = 210;

      // 1. Fast oEmbed metadata (title + artist)
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        const oembedResp = await axios.get(oembedUrl, { timeout: 5000 });
        if (oembedResp.data) {
          title = oembedResp.data.title || title;
          artist = oembedResp.data.author_name || artist;
        }
      } catch (err) {
        console.warn(`oEmbed notice for ${videoId}:`, err.message);
      }

      // 2. Get duration via youtube-dl-exec with android client
      try {
        const durOutput = await youtubedl(youtubeUrl, {
          print: 'duration',
          extractorArgs: 'youtube:player_client=android',
          noWarnings: true
        });
        const parsed = parseInt(String(durOutput).trim(), 10);
        if (!isNaN(parsed) && parsed > 0) durationSeconds = parsed;
      } catch (e) {
        // Duration extraction optional
      }

      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;

      // Pre-warm stream cache immediately in the background
      this.getDirectAudioStreamUrl(videoId).catch(() => {});

      return {
        success: true,
        sourceType: 'youtube',
        videoId,
        originalUrl: rawUrl,
        title: this.cleanSongTitle(title),
        artist: this.cleanArtistName(artist),
        duration: durationSeconds,
        durationFormatted: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
        thumbnail: maxResThumbnail,
        fallbackThumbnail: hqThumbnail,
        lowResThumbnail: mqThumbnail,
        streamUrl: `/api/songs/stream/${videoId}`
      };
    } else {
      // Direct audio / external URL
      const cleanName = rawUrl.split('/').pop().split('?')[0].replace(/\.[^/.]+$/, '') || 'Custom Audio Track';
      return {
        success: true,
        sourceType: 'direct_audio',
        videoId: null,
        originalUrl: rawUrl,
        title: decodeURIComponent(cleanName).replace(/[_-]/g, ' '),
        artist: 'Featured Artist',
        duration: 180,
        durationFormatted: '3:00',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        fallbackThumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        lowResThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        directAudioUrl: rawUrl,
        streamUrl: rawUrl
      };
    }
  }

  /**
   * Uses bundled youtube-dl-exec binary with Android player_client payload
   * to resolve unthrottled Google CDN audio stream URLs on cloud servers.
   */
  static async getDirectAudioStreamUrl(videoId, bypassCache = false) {
    if (!bypassCache) {
      const cached = streamCache.get(videoId);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.url;
      }
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Try primary Android player client (bypasses cloud IP bot checks)
    try {
      console.log(`[STREAM] Resolving Google CDN audio URL for videoId=${videoId} using android client...`);
      const output = await youtubedl(youtubeUrl, {
        getUrl: true,
        format: 'bestaudio/best',
        extractorArgs: 'youtube:player_client=android',
        noWarnings: true
      });

      if (output && typeof output === 'string' && output.trim().startsWith('http')) {
        const streamUrl = output.trim().split('\n')[0].trim();
        streamCache.set(videoId, { url: streamUrl, expiresAt: Date.now() + CACHE_TTL_MS });
        console.log(`[STREAM] SUCCESS: Resolved audio stream URL for ${videoId}`);
        return streamUrl;
      }
    } catch (err) {
      console.warn(`[STREAM] Android client extraction failed for ${videoId}:`, err.message);
    }

    // Fallback: try plain extraction
    try {
      console.log(`[STREAM] Falling back to standard extraction for videoId=${videoId}...`);
      const output = await youtubedl(youtubeUrl, {
        getUrl: true,
        format: 'bestaudio/best',
        noWarnings: true
      });

      if (output && typeof output === 'string' && output.trim().startsWith('http')) {
        const streamUrl = output.trim().split('\n')[0].trim();
        streamCache.set(videoId, { url: streamUrl, expiresAt: Date.now() + CACHE_TTL_MS });
        console.log(`[STREAM] SUCCESS: Resolved fallback stream URL for ${videoId}`);
        return streamUrl;
      }
    } catch (err2) {
      console.error(`[STREAM] Standard extraction error for ${videoId}:`, err2.message);
    }

    return null;
  }

  /**
   * Pipes audio from Google CDN directly to client response.
   */
  static async proxyAudioStream(videoId, req, res) {
    let directUrl = await this.getDirectAudioStreamUrl(videoId);

    if (!directUrl) {
      console.error(`[STREAM] ERROR: Could not resolve stream URL for videoId=${videoId}`);
      return res.status(502).json({
        success: false,
        error: 'Unable to resolve stream for this YouTube video.'
      });
    }

    try {
      await this._pipeStream(directUrl, req, res);
    } catch (proxyErr) {
      console.warn(`[STREAM] Proxy stream notice for ${videoId}:`, proxyErr.message);
      streamCache.delete(videoId);

      if (!res.headersSent) {
        return res.status(502).json({
          success: false,
          error: 'Failed to stream audio content from YouTube CDN.'
        });
      }
    }
  }

  static async _pipeStream(directUrl, req, res) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await axios({
      method: 'get',
      url: directUrl,
      responseType: 'stream',
      headers,
      timeout: 20000
    });

    res.status(response.status);
    if (response.headers['content-type']) res.set('Content-Type', response.headers['content-type']);
    if (response.headers['content-length']) res.set('Content-Length', response.headers['content-length']);
    if (response.headers['content-range']) res.set('Content-Range', response.headers['content-range']);
    if (response.headers['accept-ranges']) res.set('Accept-Ranges', response.headers['accept-ranges']);
    res.set('Cache-Control', 'public, max-age=3600');

    response.data.pipe(res);

    // Destroy stream on client disconnect / seek
    req.on('close', () => {
      if (response.data && !response.data.destroyed) {
        response.data.destroy();
      }
    });

    return new Promise((resolve) => {
      response.data.on('end', resolve);
      response.data.on('error', () => {
        resolve();
      });
    });
  }

  /**
   * Pre-warm stream cache
   */
  static async prewarmCache(videoId) {
    try {
      await this.getDirectAudioStreamUrl(videoId);
      console.log(`[PREWARM] Stream cache warmed for videoId=${videoId}`);
    } catch (e) {
      console.warn(`[PREWARM] Stream cache prewarm failed for videoId=${videoId}`);
    }
  }

  static cleanSongTitle(rawTitle) {
    if (!rawTitle) return 'Untitled Track';
    return rawTitle
      .replace(/\[official\s*(music)?\s*video\]/gi, '')
      .replace(/\(official\s*(music)?\s*video\)/gi, '')
      .replace(/\[official\s*audio\]/gi, '')
      .replace(/\(official\s*audio\)/gi, '')
      .replace(/\[lyrics?\]/gi, '')
      .replace(/\(lyrics?\)/gi, '')
      .replace(/\[hd\]/gi, '')
      .replace(/\(hd\)/gi, '')
      .replace(/\[4k\]/gi, '')
      .replace(/\(4k\)/gi, '')
      .trim();
  }

  static cleanArtistName(rawArtist) {
    if (!rawArtist) return 'Various Artists';
    return rawArtist
      .replace(/\s*-\s*Topic$/i, '')
      .replace(/VEVO$/i, '')
      .trim();
  }
}

module.exports = YouTubeService;
