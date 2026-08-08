const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Ensure data folder exists
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
}

// Initial seed tracks with high-resolution music photos and verified ad-free streams
const SEED_SONGS = [
  {
    id: 'song-lofi-01',
    title: 'Starry Night Chill',
    artist: 'Lofi Girl Beats',
    album: 'Midnight Tokyo Sessions',
    category: 'Lo-Fi & Chill',
    duration: 184,
    durationFormatted: '3:04',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: 'jfKfPfyJRdk',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    plays: 12450,
    likes: 3820,
    isFeatured: true,
    createdAt: new Date('2026-07-15').toISOString()
  },
  {
    id: 'song-synth-02',
    title: 'Midnight Horizon',
    artist: 'Cyber Dreamer',
    album: 'Neon City 2077',
    category: 'Electronic & Dance',
    duration: 215,
    durationFormatted: '3:35',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: '4xDzrJKXOOY',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    plays: 9840,
    likes: 2950,
    isFeatured: true,
    createdAt: new Date('2026-07-20').toISOString()
  },
  {
    id: 'song-pop-03',
    title: 'Golden Sunset Vibes',
    artist: 'Aura Soundscapes',
    album: 'Summer Endless',
    category: 'Pop & Hits',
    duration: 198,
    durationFormatted: '3:18',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: 'kJQP7kiw5Fk',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tuesday-glitch-113941.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    plays: 15400,
    likes: 4120,
    isFeatured: true,
    createdAt: new Date('2026-07-25').toISOString()
  },
  {
    id: 'song-acoustic-04',
    title: 'Coffee House Melody',
    artist: 'Luna Whispers',
    album: 'Wooden Strings',
    category: 'Acoustic & Indie',
    duration: 172,
    durationFormatted: '2:52',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: '36YnV9STBqc',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=acoustic-guitar-loop-f-91bpm-112668.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=36YnV9STBqc',
    plays: 8210,
    likes: 1940,
    isFeatured: false,
    createdAt: new Date('2026-08-01').toISOString()
  },
  {
    id: 'song-hiphop-05',
    title: 'Urban Boulevard Groove',
    artist: 'Metro Pulse',
    album: 'Downtown Lights',
    category: 'Hip-Hop & Rap',
    duration: 204,
    durationFormatted: '3:24',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: 'DWcJFNfaw9c',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d6e5c54e.mp3?filename=hip-hop-rock-124976.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    plays: 11300,
    likes: 3100,
    isFeatured: false,
    createdAt: new Date('2026-08-05').toISOString()
  },
  {
    id: 'song-focus-06',
    title: 'Deep Focus Ambient Flow',
    artist: 'Zenith Waves',
    album: 'Theta Wave Sanctuary',
    category: 'Focus & Study',
    duration: 240,
    durationFormatted: '4:00',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80',
    sourceType: 'direct_audio',
    videoId: 'WPni755-Krg',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    originalUrl: 'https://www.youtube.com/watch?v=WPni755-Krg',
    plays: 7450,
    likes: 1870,
    isFeatured: true,
    createdAt: new Date('2026-08-07').toISOString()
  }
];

class DBService {
  constructor() {
    this.dbPath = config.DB_FILE;
    this.data = {
      songs: [],
      categories: config.DEFAULT_CATEGORIES,
      playlists: [],
      favorites: ['song-lofi-01', 'song-synth-02', 'song-pop-03'],
      history: [],
      userProfile: {
        id: 'user-001',
        name: 'Alex Rivera',
        email: 'alex.music@example.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        plan: 'Ad-Free Premium',
        isAdFreeActive: true,
        hoursListened: 142.5,
        totalPlayed: 684,
        audioQuality: 'High (320 kbps)',
        sleepTimerMinutes: 0,
        theme: 'dark_cyberpunk',
        joinedDate: '2026-01-10'
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data.songs = SEED_SONGS;
        this.data.playlists = [
          {
            id: 'playlist-chill-01',
            title: 'Late Night Chill & Relax',
            description: 'Curated ad-free beats for relaxing, coding, and unwinding',
            thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
            songIds: ['song-lofi-01', 'song-focus-06', 'song-acoustic-04'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'playlist-workout-02',
            title: 'High Voltage Energy',
            description: 'Fast tempo beats for gaming, workouts, and driving',
            thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
            songIds: ['song-synth-02', 'song-pop-03', 'song-hiphop-05'],
            createdAt: new Date().toISOString()
          }
        ];
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to default:', err.message);
      this.data.songs = SEED_SONGS;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err.message);
    }
  }

  // Songs
  getAllSongs(filter = {}) {
    let result = [...this.data.songs];

    if (filter.category && filter.category !== 'All' && filter.category !== 'Trending') {
      result = result.filter(s => s.category.toLowerCase() === filter.category.toLowerCase());
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.artist && s.artist.toLowerCase().includes(q)) ||
        (s.album && s.album.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }

    if (filter.featuredOnly) {
      result = result.filter(s => s.isFeatured);
    }

    return result;
  }

  getSongById(id) {
    return this.data.songs.find(s => s.id === id);
  }

  getSongByVideoId(videoId) {
    return this.data.songs.find(s => s.videoId === videoId);
  }

  addSong(songData) {
    const id = songData.id || `song-${uuidv4().substring(0, 8)}`;
    const newSong = {
      id,
      title: songData.title || 'Untitled Track',
      artist: songData.artist || 'Unknown Artist',
      album: songData.album || 'Single',
      category: songData.category || 'Trending',
      duration: songData.duration || 180,
      durationFormatted: songData.durationFormatted || '3:00',
      thumbnail: songData.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      fallbackThumbnail: songData.fallbackThumbnail || songData.thumbnail,
      sourceType: songData.sourceType || 'youtube',
      videoId: songData.videoId || null,
      streamUrl: songData.streamUrl || `/api/songs/stream/${id}`,
      directAudioUrl: songData.directAudioUrl || null,
      originalUrl: songData.originalUrl || '',
      plays: 0,
      likes: 0,
      isFeatured: Boolean(songData.isFeatured),
      createdAt: new Date().toISOString()
    };

    // Prepend so newly uploaded music appears at top
    this.data.songs.unshift(newSong);
    this.save();
    return newSong;
  }

  updateSong(id, updates) {
    const index = this.data.songs.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.songs[index] = {
      ...this.data.songs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.songs[index];
  }

  deleteSong(id) {
    const initialLen = this.data.songs.length;
    this.data.songs = this.data.songs.filter(s => s.id !== id);
    this.data.favorites = this.data.favorites.filter(favId => favId !== id);
    
    // Remove from playlists
    this.data.playlists.forEach(pl => {
      pl.songIds = pl.songIds.filter(sId => sId !== id);
    });

    this.save();
    return this.data.songs.length < initialLen;
  }

  incrementPlays(id) {
    const song = this.getSongById(id);
    if (song) {
      song.plays = (song.plays || 0) + 1;
      this.data.userProfile.totalPlayed = (this.data.userProfile.totalPlayed || 0) + 1;
      this.data.userProfile.hoursListened = parseFloat((this.data.userProfile.hoursListened + (song.duration / 3600)).toFixed(2));
      
      // Add to history (avoid duplicates at the top)
      this.data.history = this.data.history.filter(hId => hId !== id);
      this.data.history.unshift(id);
      if (this.data.history.length > 50) this.data.history.pop();

      this.save();
    }
  }

  // Favorites
  getFavoriteSongs() {
    return this.data.songs.filter(s => this.data.favorites.includes(s.id));
  }

  isFavorite(songId) {
    return this.data.favorites.includes(songId);
  }

  toggleFavorite(songId) {
    const song = this.getSongById(songId);
    if (!song) return { isFavorite: false, error: 'Song not found' };

    const index = this.data.favorites.indexOf(songId);
    let isFav = false;

    if (index > -1) {
      this.data.favorites.splice(index, 1);
      song.likes = Math.max(0, (song.likes || 1) - 1);
      isFav = false;
    } else {
      this.data.favorites.unshift(songId);
      song.likes = (song.likes || 0) + 1;
      isFav = true;
    }

    this.save();
    return { isFavorite: isFav, songId, totalLikes: song.likes };
  }

  // Playlists
  getAllPlaylists() {
    return this.data.playlists.map(pl => ({
      ...pl,
      songCount: pl.songIds.length,
      songs: this.data.songs.filter(s => pl.songIds.includes(s.id))
    }));
  }

  getPlaylistById(id) {
    const pl = this.data.playlists.find(p => p.id === id);
    if (!pl) return null;
    return {
      ...pl,
      songCount: pl.songIds.length,
      songs: this.data.songs.filter(s => pl.songIds.includes(s.id))
    };
  }

  createPlaylist(title, description = '', thumbnail = null) {
    const newPl = {
      id: `playlist-${uuidv4().substring(0, 8)}`,
      title,
      description,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      songIds: [],
      createdAt: new Date().toISOString()
    };
    this.data.playlists.unshift(newPl);
    this.save();
    return newPl;
  }

  addSongToPlaylist(playlistId, songId) {
    const pl = this.data.playlists.find(p => p.id === playlistId);
    if (!pl) return false;
    if (!pl.songIds.includes(songId)) {
      pl.songIds.push(songId);
      this.save();
    }
    return true;
  }

  removeSongFromPlaylist(playlistId, songId) {
    const pl = this.data.playlists.find(p => p.id === playlistId);
    if (!pl) return false;
    pl.songIds = pl.songIds.filter(id => id !== songId);
    this.save();
    return true;
  }

  // User Profile
  getUserProfile() {
    return {
      ...this.data.userProfile,
      favoritesCount: this.data.favorites.length,
      playlistsCount: this.data.playlists.length
    };
  }

  updateUserProfile(updates) {
    this.data.userProfile = {
      ...this.data.userProfile,
      ...updates
    };
    this.save();
    return this.getUserProfile();
  }

  // Stats for Admin
  getAdminStats() {
    const totalPlays = this.data.songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const totalLikes = this.data.songs.reduce((acc, s) => acc + (s.likes || 0), 0);
    const topTracks = [...this.data.songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);

    return {
      totalSongs: this.data.songs.length,
      totalPlaylists: this.data.playlists.length,
      totalPlays,
      totalLikes,
      categoriesCount: this.data.categories.length,
      topTracks,
      adBlockingEfficiency: '100% (Zero Video/Audio Ads Served)',
      serverUptime: process.uptime()
    };
  }
}

module.exports = new DBService();
