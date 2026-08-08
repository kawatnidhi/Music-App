# 🎵 SoundVault 2077: Ad-Free Music Streaming Platform

A complete, production-ready ad-free music streaming platform built with **Dart (Flutter)** for mobile, a **Node.js Audio Stream Engine** for bypassing ads and extracting high-res YouTube artwork, and a **Modern Web Admin Dashboard** for link uploads.

---

## 🌟 Core Features

* **🚫 100% Ad-Free Audio Playback**: Pure audio stream extraction bypassing YouTube video preroll, midroll, and banner ads.
* **🖼️ Instant Music Photo Auto-Fetch**: When the admin inputs any YouTube link, the system instantly resolves the high-res music photo (`maxresdefault.jpg`), title, artist, and duration.
* **📦 Link-Only Database Architecture**: You only store links and metadata in the database (zero server storage bills).
* **📱 4 Core Dart (Flutter) Screens**:
  * **Home Screen**: Trending hero carousel, genre pills, recently uploaded tracks with music photos, live search.
  * **Library Screen**: User playlists, listening history, smart offline buffering status.
  * **Favorite Screen**: Liked tracks list with 1-tap "Shuffle All Favorites" button.
  * **Profile Screen**: User stats (hours listened, songs played), streaming quality selector (320kbps), sleep timer, and OLED dark theme.
  * **🚗 Spotify-Style Car Mode**: Pure OLED dark driving interface with oversized touch controls (96px Play button, 64px Prev/Next) and 1-tap driving presets.
  * **Full-Screen Audio Player & Mini-Player**: Persistent floating mini-player with an expanding full-screen modal featuring an **animated rotating vinyl disc**, seekbar, loop/shuffle, and queue drawer.
* **⬇️ Offline Mobile Storage**: Users can download any song to their phone's private app storage for offline listening without internet or data usage.

---

## 🏗️ Project Architecture

```
d:/Project 2077/YT music/
├── backend/                       # Node.js Streaming & Metadata Backend (Deploy to Render)
│   ├── src/
│   │   ├── services/              # YouTube scraper & ad-free stream pipe
│   │   ├── controllers/           # Song, Admin, and User controllers with Range streaming
│   │   ├── routes/api.js          # REST API endpoints
│   │   └── server.js              # Express server on port 5000
│   └── package.json
│
├── admin/                         # Web Admin Dashboard (Deploy to Vercel)
│   ├── index.html                 # Music link upload & live photo preview interface
│   ├── style.css                  # Dark glassmorphic styling
│   └── app.js                     # Auto-fetch & catalog management logic
│
├── dart_app/                      # Pure Dart / Flutter Mobile App (Android / iOS / Web)
│   ├── lib/
│   │   ├── models/                # Song, Playlist, UserProfile models
│   │   ├── services/              # ApiService, AudioPlayerService & OfflineDownloadService
│   │   ├── providers/             # AudioProvider & MusicProvider state management
│   │   ├── screens/               # Home, Library, Favorite, Profile, Player screens
│   │   ├── widgets/               # MiniPlayer, SongCard, VinylArtwork
│   │   └── main.dart              # Flutter app entry point
│   └── pubspec.yaml
│
├── web_app/                       # Web Client Companion (Test all 4 screens in browser)
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── schema.sql                     # Supabase / PostgreSQL database schema
└── README.md
```

---

## 🚀 Quick Start (Running Locally)

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
* **API Base**: `http://localhost:5000/api`
* **Admin Panel**: `http://localhost:5000/admin`
* **Web App Demo**: `http://localhost:5000/web`

### 2. Open the Admin Panel
Open `http://localhost:5000/admin` in your browser.
1. Paste any YouTube music link (e.g. `https://www.youtube.com/watch?v=jfKfPfyJRdk`).
2. Click **Auto-Fetch** — the music photo, title, artist, and duration appear instantly.
3. Click **Publish Ad-Free Track to App**.

### 3. Run the Dart / Flutter Mobile App
```bash
cd dart_app
flutter pub get
flutter run
```

---

## ☁️ Cloud Deployment (Vercel + Render + Supabase)

### 1. Supabase (Database & Realtime)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and execute `schema.sql`.
3. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Render (Backend Audio Stream Engine)
1. Create a Web Service at [render.com](https://render.com).
2. Connect your repository and select the `backend` directory.
3. Build command: `npm install`, Start command: `npm start`.
4. Render gives you your live streaming URL: `https://your-music-api.onrender.com`.

### 3. Vercel (Admin Panel & Web App)
1. Deploy the `admin` folder to [vercel.com](https://vercel.com).
2. Point API calls to your Render backend URL.
