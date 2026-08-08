const { exec } = require('child_process');
const axios = require('axios');

// In-memory cache of resolved audio stream URLs (videoId -> { url, expiresAt })
const streamCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours (Google CDN URLs expire in ~6h)

// Detect platform-appropriate yt-dlp command
const IS_WINDOWS = process.platform === 'win32';
const YT_DLP_CMD = IS_WINDOWS ? 'python -m yt_dlp' : 'yt-dlp';

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
   * Fetches metadata & high-res artwork using oEmbed + yt-dlp for duration
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

      // 2. Get duration via yt-dlp
      try {
        const dur = await this._ytdlpExec(
          `${YT_DLP_CMD} --print duration "${youtubeUrl}"`,
          15000
        );
        const parsed = parseInt(dur.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) durationSeconds = parsed;
      } catch (e) {
        // Duration extraction is optional; use default
      }

      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;

      // Pre-warm the stream cache so first play is instant
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
   * Uses yt-dlp to extract the real, direct, ad-free audio stream URL.
   * This is the ONLY reliable method — ytdl-core JS library is broken
   * against current YouTube player changes.
   */
  static async getDirectAudioStreamUrl(videoId) {
    // Check cache first
    const cached = streamCache.get(videoId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.url;
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // yt-dlp is the only reliable extractor (YouTube constantly breaks JS parsers)
    try {
      const stdout = await this._ytdlpExec(
        `${YT_DLP_CMD} -g -f bestaudio "${youtubeUrl}"`,
        30000
      );

      if (stdout && stdout.trim().startsWith('http')) {
        const url = stdout.trim().split('\n')[0].trim();
        streamCache.set(videoId, { url, expiresAt: Date.now() + CACHE_TTL_MS });
        console.log(`[STREAM] Resolved audio URL for ${videoId} (${url.substring(0, 60)}...)`);
        return url;
      }
    } catch (err) {
      console.error(`[STREAM] yt-dlp extraction FAILED for ${videoId}:`, err.message);
    }

    console.error(`[STREAM] CRITICAL: Could not resolve audio URL for ${videoId}`);
    return null;
  }

  /**
   * Pipes audio from YouTube CDN through our server to the client.
   */
  static async proxyAudioStream(videoId, req, res) {
    const directUrl = await this.getDirectAudioStreamUrl(videoId);

    if (!directUrl) {
      console.error(`[STREAM] No audio URL for ${videoId} — returning fallback`);
      return res.redirect(this.getFallbackAudio());
    }

    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };

      // Forward Range header for seeking support
      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const response = await axios({
        method: 'get',
        url: directUrl,
        responseType: 'stream',
        headers,
        timeout: 15000
      });

      // Forward content headers from Google CDN to the client
      res.status(response.status); // 200 or 206
      if (response.headers['content-type']) res.set('Content-Type', response.headers['content-type']);
      if (response.headers['content-length']) res.set('Content-Length', response.headers['content-length']);
      if (response.headers['content-range']) res.set('Content-Range', response.headers['content-range']);
      if (response.headers['accept-ranges']) res.set('Accept-Ranges', response.headers['accept-ranges']);
      res.set('Cache-Control', 'public, max-age=3600');

      response.data.pipe(res);

      response.data.on('error', (err) => {
        console.warn('Stream pipe error:', err.message);
        if (!res.headersSent) {
          res.redirect(this.getFallbackAudio());
        }
      });
    } catch (proxyErr) {
      console.warn('Proxy stream error:', proxyErr.message);
      // Invalidate cache on error
      streamCache.delete(videoId);

      if (!res.headersSent) {
        res.redirect(this.getFallbackAudio());
      }
    }
  }

  /**
   * Pre-warm cache for a videoId (called after publishing a song)
   */
  static async prewarmCache(videoId) {
    try {
      await this.getDirectAudioStreamUrl(videoId);
      console.log(`[PREWARM] Cache warmed for ${videoId}`);
    } catch (e) {
      console.warn(`[PREWARM] Failed for ${videoId}`);
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

  static getFallbackAudio() {
    return 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
  }

  /**
   * CRITICAL FIX: yt-dlp outputs warnings to stderr which causes exec() to
   * report a non-zero exit code on Windows PowerShell — but stdout still
   * contains the valid URL. This method captures stdout regardless of exit code.
   */
  static _ytdlpExec(cmd, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: timeoutMs }, (error, stdout, stderr) => {
        // yt-dlp often returns exit code 1 due to warnings on stderr,
        // but stdout still contains valid output. Check stdout first.
        if (stdout && stdout.trim().length > 0) {
          return resolve(stdout);
        }
        if (error) return reject(error);
        resolve(stdout || '');
      });
    });
  }
}

module.exports = YouTubeService;
