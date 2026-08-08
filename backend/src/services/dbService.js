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
    id: 'song-tu-aake-dekhle',
    title: 'Tu Aake Dekhle',
    artist: 'King',
    album: 'The Carnival',
    category: 'Pop & Hits',
    duration: 323,
    durationFormatted: '5:23',
    thumbnail: 'https://i.ytimg.com/vi/A66TYFdz8YA/maxresdefault.jpg',
    fallbackThumbnail: 'https://i.ytimg.com/vi/A66TYFdz8YA/hqdefault.jpg',
    sourceType: 'youtube',
    videoId: 'A66TYFdz8YA',
    streamUrl: '/api/songs/stream/A66TYFdz8YA',
    originalUrl: 'https://www.youtube.com/watch?v=A66TYFdz8YA',
    plays: 15400,
    likes: 4120,
    isFeatured: true,
    createdAt: new Date('2026-07-15').toISOString()
  },
  {
    id: 'song-woh-ikka',
    title: 'WOH',
    artist: 'Ikka x Dino James x Badshah',
    album: 'Def Jam India',
    category: 'Hip-Hop & Rap',
    duration: 329,
    durationFormatted: '5:29',
    thumbnail: 'https://i.ytimg.com/vi/EbyAoYaUcVo/maxresdefault.jpg',
    fallbackThumbnail: 'https://i.ytimg.com/vi/EbyAoYaUcVo/hqdefault.jpg',
    sourceType: 'youtube',
    videoId: 'EbyAoYaUcVo',
    streamUrl: '/api/songs/stream/EbyAoYaUcVo',
    originalUrl: 'https://www.youtube.com/watch?v=EbyAoYaUcVo',
    plays: 12450,
    likes: 3820,
    isFeatured: true,
    createdAt: new Date('2026-07-20').toISOString()
  },
  {
    id: 'song-counting-stars',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    album: 'Native',
    category: 'Pop & Hits',
    duration: 257,
    durationFormatted: '4:17',
    thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/maxresdefault.jpg',
    fallbackThumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',
    sourceType: 'youtube',
    videoId: 'hT_nvWreIhg',
    streamUrl: '/api/songs/stream/hT_nvWreIhg',
    originalUrl: 'https://www.youtube.com/watch?v=hT_nvWreIhg',
    plays: 9840,
    likes: 2950,
    isFeatured: true,
    createdAt: new Date('2026-07-25').toISOString()
  },
  {
    id: 'song-sugar-maroon5',
    title: 'Sugar',
    artist: 'Maroon 5',
    album: 'V',
    category: 'Pop & Hits',
    duration: 301,
    durationFormatted: '5:01',
    thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/maxresdefault.jpg',
    fallbackThumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
    sourceType: 'youtube',
    videoId: '09R8_2nJtjg',
    streamUrl: '/api/songs/stream/09R8_2nJtjg',
    originalUrl: 'https://www.youtube.com/watch?v=09R8_2nJtjg',
    plays: 18210,
    likes: 5940,
    isFeatured: false,
    createdAt: new Date('2026-08-01').toISOString()
  },
  {
    id: 'song-uptown-funk',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    album: 'Uptown Special',
    category: 'Electronic & Dance',
    duration: 270,
    durationFormatted: '4:30',
    thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
    fallbackThumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    sourceType: 'youtube',
    videoId: 'OPf0YbXqDm0',
    streamUrl: '/api/songs/stream/OPf0YbXqDm0',
    originalUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    plays: 21300,
    likes: 6100,
    isFeatured: false,
    createdAt: new Date('2026-08-05').toISOString()
  }
];

class DBService {
  constructor() {
    this.dbPath = config.DB_FILE;
    this.data = {
      songs: [],
      categories: config.DEFAULT_CATEGORIES,
      playlists: [],
      favorites: ['song-tu-aake-dekhle', 'song-woh-ikka'],
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
            songIds: ['song-tu-aake-dekhle', 'song-woh-ikka'],
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
