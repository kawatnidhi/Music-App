-- ==========================================================
-- 🎵 SoundVault 2077: Database Schema for Supabase / PostgreSQL
-- Stores music links, metadata, playlists, and favorites
-- (Audio files are streamed dynamically on-demand, zero storage cost!)
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Songs Catalog Table (Stores YouTube links, photos, and metadata)
CREATE TABLE IF NOT EXISTS public.songs (
  id TEXT PRIMARY KEY DEFAULT ('song-' || substr(md5(random()::text), 1, 8)),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Various Artists',
  album TEXT DEFAULT 'Single',
  category TEXT DEFAULT 'Trending',
  duration INTEGER DEFAULT 180,
  duration_formatted TEXT DEFAULT '3:00',
  thumbnail TEXT NOT NULL,
  fallback_thumbnail TEXT,
  video_id TEXT,
  original_url TEXT NOT NULL,
  stream_url TEXT,
  source_type TEXT DEFAULT 'youtube',
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
  id TEXT PRIMARY KEY DEFAULT ('playlist-' || substr(md5(random()::text), 1, 8)),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail TEXT DEFAULT 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Playlist Tracks Junction Table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id TEXT REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id TEXT REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- 5. User Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- 6. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Music Lover',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  plan TEXT DEFAULT 'Ad-Free Perpetual Pass',
  is_ad_free_active BOOLEAN DEFAULT true,
  hours_listened NUMERIC(10,2) DEFAULT 0.0,
  total_played INTEGER DEFAULT 0,
  audio_quality TEXT DEFAULT 'High (320 kbps)',
  sleep_timer_minutes INTEGER DEFAULT 0,
  theme TEXT DEFAULT 'dark_cyberpunk',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Seed Initial Popular Tracks with Verified Ad-Free Audio Streams & High-Res Artwork
INSERT INTO public.songs (id, title, artist, album, category, duration, duration_formatted, thumbnail, fallback_thumbnail, video_id, original_url, stream_url, plays, likes, is_featured)
VALUES
  ('song-lofi-01', 'Starry Night Chill', 'Lofi Girl Beats', 'Midnight Tokyo Sessions', 'Lo-Fi & Chill', 184, '3:04', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400', 'jfKfPfyJRdk', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3', 12450, 3820, true),
  ('song-synth-02', 'Midnight Horizon', 'Cyber Dreamer', 'Neon City 2077', 'Electronic & Dance', 215, '3:35', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400', '4xDzrJKXOOY', 'https://www.youtube.com/watch?v=4xDzrJKXOOY', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3', 9840, 2950, true),
  ('song-pop-03', 'Golden Sunset Vibes', 'Aura Soundscapes', 'Summer Endless', 'Pop & Hits', 198, '3:18', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 'kJQP7kiw5Fk', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tuesday-glitch-113941.mp3', 15400, 4120, true),
  ('song-acoustic-04', 'Coffee House Melody', 'Luna Whispers', 'Wooden Strings', 'Acoustic & Indie', 172, '2:52', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', '36YnV9STBqc', 'https://www.youtube.com/watch?v=36YnV9STBqc', 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=acoustic-guitar-loop-f-91bpm-112668.mp3', 8210, 1940, false),
  ('song-hiphop-05', 'Urban Boulevard Groove', 'Metro Pulse', 'Downtown Lights', 'Hip-Hop & Rap', 204, '3:24', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', 'DWcJFNfaw9c', 'https://www.youtube.com/watch?v=DWcJFNfaw9c', 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d6e5c54e.mp3?filename=hip-hop-rock-124976.mp3', 11300, 3100, false)
ON CONFLICT (id) DO NOTHING;

-- 8. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
