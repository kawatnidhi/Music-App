const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  DATA_DIR: path.join(__dirname, '../data'),
  DB_FILE: path.join(__dirname, '../data/database.json'),
  DEFAULT_CATEGORIES: [
    'Trending',
    'Lo-Fi & Chill',
    'Pop & Hits',
    'Hip-Hop & Rap',
    'Electronic & Dance',
    'Acoustic & Indie',
    'Rock & Metal',
    'Focus & Study'
  ]
};
