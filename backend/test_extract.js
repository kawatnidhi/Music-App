const ytdl = require('@distube/ytdl-core');
const axios = require('axios');

async function extractYouTubeInfo(url) {
  try {
    // Extract video ID
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Standard high-res photo URLs from YouTube CDN
    const maxResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const hqThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    let title = 'YouTube Track';
    let author = 'Unknown Artist';
    let durationSeconds = 180;

    // Use oEmbed API as fast and reliable metadata source
    try {
      const oembedRes = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, { timeout: 4000 });
      if (oembedRes.data) {
        title = oembedRes.data.title || title;
        author = oembedRes.data.author_name || author;
      }
    } catch (e) {
      console.log('oEmbed fallback used:', e.message);
    }

    // Try full ytdl extraction for formats & duration if available
    let streamUrl = '';
    try {
      const info = await ytdl.getInfo(videoId);
      title = info.videoDetails.title || title;
      author = info.videoDetails.author?.name || author;
      durationSeconds = parseInt(info.videoDetails.lengthSeconds) || durationSeconds;
      
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      if (audioFormats.length > 0) {
        // Pick best audio format
        audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        streamUrl = audioFormats[0].url;
      }
    } catch (ytdlErr) {
      console.log('ytdl-core direct info notice:', ytdlErr.message);
    }

    return {
      success: true,
      videoId,
      title,
      artist: author,
      duration: durationSeconds,
      thumbnail: maxResThumbnail,
      fallbackThumbnail: hqThumbnail,
      streamUrl: streamUrl || `/api/stream/${videoId}`,
      directLink: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// Test with a sample song
extractYouTubeInfo('https://www.youtube.com/watch?v=jfKfPfyJRdk').then(res => {
  console.log('Test Extraction Result:', JSON.stringify(res, null, 2));
});
