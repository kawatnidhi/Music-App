// Dynamic API Base URL (Local vs Live Render Cloud Backend)
const API_BASE = (window.ENV_API_URL) || (window.location.port === '5000' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : 'https://soundvault-music-engine.onrender.com/api');

// Current active track preview state
let currentPreview = {
  url: '',
  title: 'Starry Night Chill',
  artist: 'Lofi Girl Beats',
  category: 'Lo-Fi & Chill',
  duration: 184,
  durationFormatted: '3:04',
  thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  streamUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
};

let allCatalogSongs = [];
const audioPlayer = document.getElementById('globalAudioPlayer');
let isAudioPlaying = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadCatalog();
  setupAudioListeners();

  // Auto-fetch with debounce when typing in music URL
  const musicUrlInput = document.getElementById('musicUrl');
  let debounceTimeout = null;
  musicUrlInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    const val = e.target.value.trim();
    if (val.length > 10 && (val.includes('youtube') || val.includes('youtu.be') || val.startsWith('http'))) {
      debounceTimeout = setTimeout(() => {
        extractLinkInfo();
      }, 700);
    }
  });

  // Sync title and artist inputs with live preview
  document.getElementById('songTitle').addEventListener('input', (e) => {
    document.getElementById('previewTitle').innerText = e.target.value || 'Untitled Track';
  });

  document.getElementById('artistName').addEventListener('input', (e) => {
    document.getElementById('previewArtist').innerText = e.target.value || 'Various Artists';
  });

  document.getElementById('categorySelect').addEventListener('change', (e) => {
    document.getElementById('previewCategory').innerText = e.target.value;
  });
});

// Load real-time dashboard statistics
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const data = await res.json();
    if (data.success && data.stats) {
      document.getElementById('statTotalSongs').innerText = data.stats.totalSongs;
      document.getElementById('statTotalPlays').innerText = data.stats.totalPlays.toLocaleString();
      document.getElementById('statCategories').innerText = data.stats.categoriesCount;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Load music catalog table
async function loadCatalog() {
  try {
    const res = await fetch(`${API_BASE}/songs`);
    const data = await res.json();
    if (data.success && data.songs) {
      allCatalogSongs = data.songs;
      renderCatalogTable(allCatalogSongs);
    }
  } catch (err) {
    showToast('Error loading catalog: ' + err.message, 'error');
  }
}

// Render catalog table
function renderCatalogTable(songs) {
  const tbody = document.getElementById('catalogTableBody');
  if (!songs || songs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No tracks uploaded yet. Paste a YouTube link above!</td></tr>`;
    return;
  }

  tbody.innerHTML = songs.map((s, index) => `
    <tr class="track-row">
      <td style="color: var(--text-muted); font-weight: 600;">#${index + 1}</td>
      <td>
        <div class="track-cell-info">
          <img src="${s.thumbnail || s.fallbackThumbnail}" alt="${s.title}" class="table-thumb" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'">
          <div class="track-names">
            <strong>${escapeHtml(s.title)}</strong>
            <span>${escapeHtml(s.artist)} ${s.album ? '• ' + escapeHtml(s.album) : ''}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="category-tag">${escapeHtml(s.category)}</span>
      </td>
      <td style="color: var(--text-secondary);">${s.durationFormatted || '3:00'}</td>
      <td style="color: #fff; font-weight: 600;">${(s.plays || 0).toLocaleString()}</td>
      <td>
        <span class="badge-adfree" style="font-size: 0.7rem;">
          <i class="fa-solid fa-check"></i> Ad-Free
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" onclick="playCatalogTrack('${s.id}')" title="Play Ad-Free Stream">
            <i class="fa-solid fa-play"></i>
          </button>
          <button class="btn btn-danger" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" onclick="deleteTrack('${s.id}')" title="Delete Track">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Extract YouTube metadata & high-resolution artwork
async function extractLinkInfo() {
  const urlInput = document.getElementById('musicUrl');
  const url = urlInput.value.trim();

  if (!url) {
    showToast('Please enter a YouTube or audio stream link', 'error');
    return;
  }

  showToast('Extracting music photo & track info...', 'success');

  try {
    const res = await fetch(`${API_BASE}/admin/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const result = await res.json();

    if (result.success && result.data) {
      const data = result.data;
      currentPreview = {
        ...currentPreview,
        ...data,
        url: url
      };

      // Populate input fields
      document.getElementById('songTitle').value = data.title;
      document.getElementById('artistName').value = data.artist;
      document.getElementById('customArtwork').value = data.thumbnail;

      // Update preview card
      updatePreviewUI(data);

      showToast('Music photo and metadata extracted successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to extract link info', 'error');
    }
  } catch (err) {
    showToast('Extraction error: ' + err.message, 'error');
  }
}

// Update the live preview card
function updatePreviewUI(data) {
  const previewImg = document.getElementById('previewImg');
  const previewTitle = document.getElementById('previewTitle');
  const previewArtist = document.getElementById('previewArtist');
  const previewDuration = document.getElementById('previewDuration');
  const previewCategory = document.getElementById('previewCategory');

  previewImg.src = data.thumbnail || data.fallbackThumbnail;
  previewTitle.innerText = data.title;
  previewArtist.innerText = data.artist;
  previewDuration.innerText = data.durationFormatted || '3:00';
  document.getElementById('audioTotalTime').innerText = data.durationFormatted || '3:00';

  const catVal = document.getElementById('categorySelect').value;
  previewCategory.innerText = catVal;

  if (data.directAudioUrl) {
    currentPreview.streamUrl = data.directAudioUrl;
  } else if (data.videoId) {
    currentPreview.streamUrl = `${API_BASE}/songs/stream/${data.videoId}`;
  }
}

function updatePreviewArtwork(newUrl) {
  if (newUrl) {
    document.getElementById('previewImg').src = newUrl;
  }
}

// Publish track to app catalog
async function publishTrack() {
  const url = document.getElementById('musicUrl').value.trim();
  const title = document.getElementById('songTitle').value.trim();
  const artist = document.getElementById('artistName').value.trim();
  const category = document.getElementById('categorySelect').value;
  const album = document.getElementById('albumName').value.trim();
  const customArtwork = document.getElementById('customArtwork').value.trim();
  const isFeatured = document.getElementById('isFeatured').checked;

  if (!url || !title || !artist) {
    showToast('Please fill in required fields (Link, Title, Artist)', 'error');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing to App...';

  try {
    const res = await fetch(`${API_BASE}/admin/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        title,
        artist,
        category,
        album,
        thumbnail: customArtwork || currentPreview.thumbnail,
        duration: currentPreview.duration,
        durationFormatted: currentPreview.durationFormatted,
        isFeatured
      })
    });

    const result = await res.json();

    if (result.success) {
      showToast(`🎉 "${title}" published to mobile & web app!`, 'success');
      
      // Reset form
      document.getElementById('uploadForm').reset();
      document.getElementById('isFeatured').checked = true;

      // Reload data
      loadStats();
      loadCatalog();
    } else {
      showToast(result.error || 'Failed to publish song', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Publish Ad-Free Track to App';
  }
}

// Delete track
async function deleteTrack(id) {
  if (!confirm('Are you sure you want to remove this track from the catalog?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/songs/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      showToast('Track removed from catalog', 'success');
      loadStats();
      loadCatalog();
    }
  } catch (err) {
    showToast('Delete error: ' + err.message, 'error');
  }
}

// Quick Sample setter
function setSample(youtubeUrl) {
  const urlInput = document.getElementById('musicUrl');
  urlInput.value = youtubeUrl;
  extractLinkInfo();
}

// Filter catalog in search
function filterCatalog(query) {
  const q = query.toLowerCase();
  const filtered = allCatalogSongs.filter(s => 
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  );
  renderCatalogTable(filtered);
}

// Audio Player Handlers for preview bar
function setupAudioListeners() {
  const progressFill = document.getElementById('audioProgressFill');
  const currentTimeSpan = document.getElementById('audioCurrentTime');

  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
      const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressFill.style.width = `${pct}%`;

      const mins = Math.floor(audioPlayer.currentTime / 60);
      const secs = Math.floor(audioPlayer.currentTime % 60);
      currentTimeSpan.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  });

  audioPlayer.addEventListener('ended', () => {
    isAudioPlaying = false;
    document.getElementById('previewPlayIcon').className = 'fa-solid fa-play';
    progressFill.style.width = '0%';
  });
}

function toggleTestAudio() {
  const icon = document.getElementById('previewPlayIcon');
  if (isAudioPlaying) {
    audioPlayer.pause();
    isAudioPlaying = false;
    icon.className = 'fa-solid fa-play';
  } else {
    // Always use our proxy endpoint for YouTube songs
    let playUrl;
    if (currentPreview.videoId) {
      playUrl = `/api/songs/stream/${currentPreview.videoId}`;
    } else if (currentPreview.id) {
      playUrl = `/api/songs/stream/${currentPreview.id}`;
    } else if (currentPreview.streamUrl && currentPreview.streamUrl.startsWith('/')) {
      playUrl = currentPreview.streamUrl;
    } else {
      playUrl = currentPreview.streamUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
    }

    audioPlayer.src = playUrl;
    audioPlayer.load();
    audioPlayer.play().then(() => {
      isAudioPlaying = true;
      icon.className = 'fa-solid fa-pause';
      showToast('Playing ad-free stream preview...', 'success');
    }).catch(err => {
      console.warn('Playback notice:', err.message);
      showToast('Audio loading — please wait a moment and try again', 'error');
    });
  }
}

function playCatalogTrack(id) {
  const track = allCatalogSongs.find(s => s.id === id);
  if (!track) return;

  currentPreview = { ...track };
  updatePreviewUI(track);

  // Always use our proxy endpoint
  let playUrl;
  if (track.videoId) {
    playUrl = `/api/songs/stream/${track.videoId}`;
  } else {
    playUrl = `/api/songs/stream/${track.id}`;
  }

  audioPlayer.src = playUrl;
  audioPlayer.load();
  audioPlayer.play().then(() => {
    isAudioPlaying = true;
    document.getElementById('previewPlayIcon').className = 'fa-solid fa-pause';
    showToast(`Streaming "${track.title}" (Ad-Free)`, 'success');
  }).catch(e => {
    console.warn('Catalog playback notice:', e.message);
    showToast('Audio loading — please wait a moment and try again', 'error');
  });
}

function seekAudio(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const fraction = clickX / width;
  if (audioPlayer.duration) {
    audioPlayer.currentTime = fraction * audioPlayer.duration;
  }
}

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}" style="color: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
