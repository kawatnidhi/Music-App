// Dynamic API Base URL (Supports Local & Render/Vercel Cloud Deployment)
const API_BASE = (window.ENV_API_URL) || (window.location.port === '5000' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : '/api');

let allSongs = [];
let categories = [];
let favorites = [];
let playlists = [];
let currentCategory = 'Trending';
let currentSearch = '';

let currentQueue = [];
let currentTrack = null;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

const audio = document.getElementById('coreAudioPlayer');

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupAudioListeners();
  setupKeyboardShortcuts();
});

async function initApp() {
  await Promise.all([
    loadSongs(),
    loadCategories(),
    loadFavorites(),
    loadPlaylists()
  ]);
}

async function loadSongs() {
  try {
    const res = await fetch(`${API_BASE}/songs`);
    const data = await res.json();
    if (data.success && data.songs) {
      allSongs = data.songs;
      renderHomeScreen();
    }
  } catch (err) {
    console.error('Error loading songs:', err);
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/songs/categories`);
    const data = await res.json();
    if (data.success && data.categories) {
      categories = data.categories;
      renderCategories();
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadFavorites() {
  try {
    const res = await fetch(`${API_BASE}/favorites`);
    const data = await res.json();
    if (data.success && data.favorites) {
      favorites = data.favorites;
      document.getElementById('favCountText').innerText = `${favorites.length} ad-free tracks`;
      renderFavoritesScreen();
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadPlaylists() {
  try {
    const res = await fetch(`${API_BASE}/playlists`);
    const data = await res.json();
    if (data.success && data.playlists) {
      playlists = data.playlists;
      renderPlaylists();
    }
  } catch (err) {
    console.error(err);
  }
}

// Render Home Screen
function renderHomeScreen() {
  const featured = allSongs.filter(s => s.isFeatured);
  const featContainer = document.getElementById('featuredCarousel');
  featContainer.innerHTML = featured.map(s => `
    <div class="featured-card" onclick="playSong('${s.id}')">
      <img src="${s.thumbnail || s.fallbackThumbnail}" alt="${s.title}" class="featured-card-bg" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'">
      <div class="featured-overlay">
        <div class="featured-tag">🔥 TRENDING</div>
        <div class="featured-info">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: #fff;">${escapeHtml(s.title)}</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(s.artist)}</p>
          </div>
          <div class="play-circle-btn">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  renderFilteredSongs();
}

function renderCategories() {
  const container = document.getElementById('categoryPills');
  container.innerHTML = categories.map(cat => `
    <button class="category-pill ${cat === currentCategory ? 'active' : ''}" onclick="selectCategory('${cat}', this)">
      ${escapeHtml(cat)}
    </button>
  `).join('');
}

function selectCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFilteredSongs();
}

function onSearch(query) {
  currentSearch = query.trim().toLowerCase();
  renderFilteredSongs();
}

function renderFilteredSongs() {
  const container = document.getElementById('homeSongList');
  let filtered = [...allSongs];

  if (currentCategory !== 'All' && currentCategory !== 'Trending') {
    filtered = filtered.filter(s => s.category.toLowerCase() === currentCategory.toLowerCase());
  }

  if (currentSearch) {
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(currentSearch) ||
      s.artist.toLowerCase().includes(currentSearch) ||
      s.category.toLowerCase().includes(currentSearch)
    );
  }

  document.getElementById('songCountText').innerText = `${filtered.length} tracks`;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No tracks match your query.</div>`;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isCur = currentTrack && currentTrack.id === s.id;
    const isFav = favorites.some(f => f.id === s.id);
    return `
      <div class="song-card ${isCur ? 'active' : ''}" onclick="playSong('${s.id}')">
        <img src="${s.thumbnail || s.fallbackThumbnail}" alt="${s.title}" class="song-thumb" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'">
        <div class="song-info">
          <div class="song-title">${escapeHtml(s.title)}</div>
          <div class="song-artist">${escapeHtml(s.artist)} • <span style="color: var(--accent-cyan);">${escapeHtml(s.category)}</span></div>
        </div>
        <div class="song-actions">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${s.durationFormatted || '3:00'}</span>
          <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${s.id}')">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Play a specific song by ID
function playSong(songId) {
  const song = allSongs.find(s => s.id === songId);
  if (!song) return;

  currentTrack = song;
  currentQueue = [...allSongs];

  // ALWAYS use our backend proxy endpoint for YouTube songs.
  // Never set audio.src to a raw Google CDN URL — it will fail with CORS.
  let streamUrl;
  if (song.videoId) {
    streamUrl = `${API_BASE}/songs/stream/${song.videoId}`;
  } else if (song.streamUrl && song.streamUrl.startsWith('http')) {
    streamUrl = song.streamUrl;
  } else {
    streamUrl = `${API_BASE}/songs/stream/${song.id}`;
  }

  audio.src = streamUrl;
  audio.load();
  audio.play().then(() => {
    isPlaying = true;
    updateUIPlayer();
  }).catch(e => {
    console.warn('Playback notice, retrying via song ID:', e.message);
    // Retry with song ID as fallback
    audio.src = `${API_BASE}/songs/stream/${song.id}`;
    audio.load();
    audio.play().then(() => {
      isPlaying = true;
      updateUIPlayer();
    }).catch(e2 => {
      console.error('All playback attempts failed:', e2.message);
    });
  });

  updateUIPlayer();
}

function updateUIPlayer() {
  if (!currentTrack) return;

  // Mini Player
  const mini = document.getElementById('miniPlayer');
  if (mini) mini.style.display = 'flex';
  const miniThumb = document.getElementById('miniThumb');
  if (miniThumb) miniThumb.src = currentTrack.thumbnail || currentTrack.fallbackThumbnail;
  const miniTitle = document.getElementById('miniTitle');
  if (miniTitle) miniTitle.innerText = currentTrack.title;
  const miniArtist = document.getElementById('miniArtist');
  if (miniArtist) miniArtist.innerText = currentTrack.artist;
  const miniPlayIcon = document.getElementById('miniPlayIcon');
  if (miniPlayIcon) miniPlayIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';

  // Full Player Modal
  const fullArtwork = document.getElementById('fullArtwork');
  if (fullArtwork) fullArtwork.src = currentTrack.thumbnail || currentTrack.fallbackThumbnail;
  const fullTitle = document.getElementById('fullTitle');
  if (fullTitle) fullTitle.innerText = currentTrack.title;
  const fullArtist = document.getElementById('fullArtist');
  if (fullArtist) fullArtist.innerText = currentTrack.artist;
  const fullCategory = document.getElementById('fullCategory');
  if (fullCategory) fullCategory.innerText = currentTrack.category;
  const fullTotalTime = document.getElementById('fullTotalTime');
  if (fullTotalTime) fullTotalTime.innerText = currentTrack.durationFormatted || '3:00';
  const fullPlayIcon = document.getElementById('fullPlayIcon');
  if (fullPlayIcon) fullPlayIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';

  // Spotify-style Car Mode UI
  const carArtwork = document.getElementById('carArtwork');
  if (carArtwork) carArtwork.src = currentTrack.thumbnail || currentTrack.fallbackThumbnail;
  const carTitle = document.getElementById('carTitle');
  if (carTitle) carTitle.innerText = currentTrack.title;
  const carArtist = document.getElementById('carArtist');
  if (carArtist) carArtist.innerText = currentTrack.artist;
  const carPlayIcon = document.getElementById('carPlayIcon');
  if (carPlayIcon) carPlayIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';

  // Vinyl disc spin
  const disc = document.getElementById('vinylDisc');
  if (disc) {
    if (isPlaying) {
      disc.classList.add('playing');
    } else {
      disc.classList.remove('playing');
    }
  }

  // Favorite states
  const isFav = favorites.some(f => f.id === currentTrack.id);
  const fullLike = document.getElementById('fullLikeBtn');
  if (fullLike) fullLike.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart" style="color: ${isFav ? 'var(--accent-pink)' : 'var(--text-muted)'};"></i>`;
  const carLike = document.getElementById('carLikeBtn');
  if (carLike) carLike.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart" style="color: ${isFav ? 'var(--accent-pink)' : '#fff'};"></i>`;

  renderFilteredSongs();
}

function togglePlayPause() {
  if (!currentTrack && allSongs.length > 0) {
    playSong(allSongs[0].id);
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updateUIPlayer();
}

function playNext() {
  if (currentQueue.length === 0) return;
  let idx = currentQueue.findIndex(s => s.id === currentTrack?.id);
  if (isShuffle) {
    idx = Math.floor(Math.random() * currentQueue.length);
  } else {
    idx = (idx + 1) % currentQueue.length;
  }
  playSong(currentQueue[idx].id);
}

function playPrev() {
  if (currentQueue.length === 0) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  let idx = currentQueue.findIndex(s => s.id === currentTrack?.id);
  idx = (idx - 1 + currentQueue.length) % currentQueue.length;
  playSong(currentQueue[idx].id);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  const color = isShuffle ? 'var(--accent-cyan)' : 'var(--text-muted)';
  document.getElementById('shuffleBtn').style.color = color;
  document.getElementById('carShuffleBtn').style.color = isShuffle ? 'var(--accent-cyan)' : '#fff';
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  document.getElementById('repeatBtn').style.color = isRepeat ? 'var(--accent-cyan)' : 'var(--text-muted)';
}

// Volume Controller functions
let preMuteVolume = 1.0;
function onVolumeChange(val) {
  audio.volume = parseFloat(val);
  const pct = Math.round(audio.volume * 100);
  document.getElementById('volumePercent').innerText = `${pct}%`;
  
  const icon = document.getElementById('volMuteIcon');
  if (audio.volume === 0) {
    icon.className = 'fa-solid fa-volume-xmark';
  } else if (audio.volume < 0.5) {
    icon.className = 'fa-solid fa-volume-low';
  } else {
    icon.className = 'fa-solid fa-volume-high';
  }
}

function toggleMute() {
  const slider = document.getElementById('volumeSlider');
  if (audio.volume > 0) {
    preMuteVolume = audio.volume;
    audio.volume = 0;
    slider.value = 0;
  } else {
    audio.volume = preMuteVolume > 0 ? preMuteVolume : 0.8;
    slider.value = audio.volume;
  }
  onVolumeChange(audio.volume);
}

// Car Mode Actions
function openCarMode() {
  if (!currentTrack && allSongs.length > 0) {
    playSong(allSongs[0].id);
  }
  document.getElementById('carModeOverlay').classList.add('open');
  updateUIPlayer();
}

function closeCarMode() {
  document.getElementById('carModeOverlay').classList.remove('open');
}

function playPreset(cat) {
  const match = allSongs.find(s => s.category.toLowerCase().includes(cat.toLowerCase()));
  if (match) {
    playSong(match.id);
  }
}

function setupAudioListeners() {
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      const miniProg = document.getElementById('miniProgress');
      if (miniProg) miniProg.style.width = `${pct}%`;
      const fullProg = document.getElementById('fullProgressFill');
      if (fullProg) fullProg.style.width = `${pct}%`;

      const m = Math.floor(audio.currentTime / 60);
      const s = Math.floor(audio.currentTime % 60);
      const curTime = document.getElementById('fullCurrentTime');
      if (curTime) curTime.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      playNext();
    }
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio element error:', audio.error?.message || 'Unknown error');
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      playNext();
    } else if (e.code === 'ArrowLeft') {
      playPrev();
    }
  });
}

function seekAudioBar(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const fraction = (event.clientX - rect.left) / rect.width;
  if (audio.duration) {
    audio.currentTime = fraction * audio.duration;
  }
}

// Full Player Modal
function openFullPlayer() {
  document.getElementById('fullPlayerModal').classList.add('open');
}

function closeFullPlayer() {
  document.getElementById('fullPlayerModal').classList.remove('open');
}

// Favorites management
async function toggleFavorite(songId) {
  try {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId })
    });
    const data = await res.json();
    if (data.success) {
      await loadFavorites();
      updateUIPlayer();
    }
  } catch (err) {
    console.error(err);
  }
}

function toggleCurrentFavorite() {
  if (currentTrack) {
    toggleFavorite(currentTrack.id);
  }
}

function renderFavoritesScreen() {
  const container = document.getElementById('favSongList');
  if (favorites.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem;">No liked songs yet. Tap the heart on any song!</div>`;
    return;
  }

  container.innerHTML = favorites.map(s => `
    <div class="song-card" onclick="playSong('${s.id}')">
      <img src="${s.thumbnail || s.fallbackThumbnail}" alt="${s.title}" class="song-thumb" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'">
      <div class="song-info">
        <div class="song-title">${escapeHtml(s.title)}</div>
        <div class="song-artist">${escapeHtml(s.artist)}</div>
      </div>
      <button class="fav-btn active" onclick="event.stopPropagation(); toggleFavorite('${s.id}')">
        <i class="fa-solid fa-heart"></i>
      </button>
    </div>
  `).join('');
}

function shufflePlayFavorites() {
  if (favorites.length === 0) return;
  const shuffled = [...favorites].sort(() => Math.random() - 0.5);
  currentQueue = shuffled;
  playSong(shuffled[0].id);
}

// Tab Switching
function switchTab(tabName, btn) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  if (btn) btn.classList.add('active');

  if (tabName === 'home') {
    document.getElementById('screen-home').style.display = 'block';
  } else if (tabName === 'library') {
    document.getElementById('screen-library').style.display = 'block';
    renderPlaylists();
  } else if (tabName === 'favorites') {
    document.getElementById('screen-favorites').style.display = 'block';
    renderFavoritesScreen();
  } else if (tabName === 'profile') {
    document.getElementById('screen-profile').style.display = 'block';
  }
}

function showLibraryTab(type, btn) {
  document.querySelectorAll('#screen-library .category-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const container = document.getElementById('libraryContent');

  if (type === 'playlists') {
    renderPlaylists();
  } else if (type === 'history') {
    container.innerHTML = allSongs.slice(0, 5).map(s => `
      <div class="song-card" onclick="playSong('${s.id}')">
        <img src="${s.thumbnail}" class="song-thumb">
        <div class="song-info">
          <div class="song-title">${escapeHtml(s.title)}</div>
          <div class="song-artist">${escapeHtml(s.artist)} • Played Recently</div>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
        <i class="fa-solid fa-bolt" style="font-size: 2.5rem; color: var(--accent-cyan); margin-bottom: 0.75rem;"></i>
        <h4 style="color: #fff;">Offline Streaming Engine</h4>
        <p style="font-size: 0.8rem; margin-top: 4px;">Zero latency local streaming buffer enabled.</p>
      </div>
    `;
  }
}

function renderPlaylists() {
  const container = document.getElementById('libraryContent');
  if (playlists.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No playlists yet.</div>`;
    return;
  }

  container.innerHTML = playlists.map(pl => `
    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;">
      <img src="${pl.thumbnail}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;">
      <div style="flex: 1;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(pl.title)}</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary);">${pl.songCount || 3} ad-free tracks • Playlist</p>
      </div>
      <button onclick="if(allSongs.length) playSong(allSongs[0].id)" style="background: none; border: none; color: var(--accent-cyan); font-size: 1.6rem; cursor: pointer;">
        <i class="fa-solid fa-circle-play"></i>
      </button>
    </div>
  `).join('');
}

function promptCreatePlaylist() {
  const title = prompt('Enter Playlist Name:');
  if (title) {
    fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: 'Created in app' })
    }).then(() => loadPlaylists());
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
