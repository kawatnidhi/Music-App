const express = require('express');
const router = express.Router();
const SongController = require('../controllers/songController');
const AdminController = require('../controllers/adminController');
const UserController = require('../controllers/userController');

// --- Health Check ---
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Ad-Free Music Streaming Core Engine',
    timestamp: new Date().toISOString(),
    adFreeStatus: 'Active & Verified',
    version: '2.0.77'
  });
});

// --- Specific Songs & Streaming Routes (MUST be defined before /songs/:id parameter) ---
router.get('/songs/categories', SongController.getCategories);
router.get('/songs/history', SongController.getHistory);

// Stream endpoints: both /songs/stream/:id and /songs/:id/stream and /stream/:id
router.get('/songs/stream/:id', SongController.streamAudio);
router.get('/songs/:id/stream', SongController.streamAudio);
router.get('/stream/:id', SongController.streamAudio);

// Song catalog list and specific song details
router.get('/songs', SongController.getAll);
router.get('/songs/:id', SongController.getById);

// --- Admin Portal & Link Upload ---
router.post('/admin/extract', AdminController.extractMetadata);
router.post('/admin/songs', AdminController.createSong);
router.put('/admin/songs/:id', AdminController.updateSong);
router.delete('/admin/songs/:id', AdminController.deleteSong);
router.get('/admin/stats', AdminController.getStats);

// --- User Favorites, Playlists & Profile ---
router.get('/favorites', UserController.getFavorites);
router.post('/favorites/toggle', UserController.toggleFavorite);
router.get('/playlists', UserController.getPlaylists);
router.post('/playlists', UserController.createPlaylist);
router.post('/playlists/:id/add', UserController.addTrackToPlaylist);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

module.exports = router;
