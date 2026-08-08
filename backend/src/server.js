const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static assets (Admin Panel & Web Preview)
app.use('/admin', express.static(path.join(__dirname, '../../admin')));
app.use('/web', express.static(path.join(__dirname, '../../web_app')));

// API Routes
app.use('/api', apiRoutes);

// Root greeting / status
app.get('/', (req, res) => {
  res.json({
    name: '🎵 Ad-Free YouTube Music Streaming API Server',
    status: 'Running smoothly without ads',
    endpoints: {
      adminPanel: 'http://localhost:5000/admin',
      webApp: 'http://localhost:5000/web',
      songsCatalog: 'http://localhost:5000/api/songs',
      categories: 'http://localhost:5000/api/songs/categories',
      userProfile: 'http://localhost:5000/api/profile',
      favorites: 'http://localhost:5000/api/favorites',
      adminStats: 'http://localhost:5000/api/admin/stats'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(config.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Ad-Free Music Server is running on port ${config.PORT}`);
  console.log(`📡 API Base:     http://localhost:${config.PORT}/api`);
  console.log(`👑 Admin Panel:  http://localhost:${config.PORT}/admin`);
  console.log(`📱 Web App Demo: http://localhost:${config.PORT}/web`);
  console.log(`======================================================\n`);
});
