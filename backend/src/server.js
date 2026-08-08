const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Helper to resolve static paths across local dev & Render Docker container
const resolveStaticDir = (relativePaths) => {
  for (const relPath of relativePaths) {
    const absPath = path.resolve(__dirname, relPath);
    if (fs.existsSync(absPath)) {
      return absPath;
    }
  }
  return path.resolve(__dirname, relativePaths[0]);
};

const adminPath = resolveStaticDir(['../../admin', '../admin', './admin']);
const webPath = resolveStaticDir(['../../web_app', '../web_app', './web_app']);

// Static assets (Admin Panel & Web Preview)
app.use('/admin', express.static(adminPath));
app.use('/web', express.static(webPath));

// Direct GET handlers for /admin and /web (handles requests without trailing slash)
app.get('/admin', (req, res) => {
  const indexFile = path.join(adminPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Admin panel files not found on server.');
  }
});

app.get('/web', (req, res) => {
  const indexFile = path.join(webPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Web app files not found on server.');
  }
});

// API Routes
app.use('/api', apiRoutes);

// Root greeting / status
app.get('/', (req, res) => {
  res.json({
    name: '🎵 Ad-Free YouTube Music Streaming API Server',
    status: 'Running smoothly without ads',
    endpoints: {
      adminPanel: '/admin',
      webApp: '/web',
      songsCatalog: '/api/songs',
      categories: '/api/songs/categories',
      userProfile: '/api/profile',
      favorites: '/api/favorites',
      adminStats: '/api/admin/stats'
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
