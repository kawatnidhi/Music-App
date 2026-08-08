import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/audio_provider.dart';
import '../providers/music_provider.dart';
import '../models/song.dart';
import '../utils/constants.dart';

class CarModeScreen extends StatefulWidget {
  const CarModeScreen({Key? key}) : super(key: key);

  @override
  State<CarModeScreen> createState() => _CarModeScreenState();
}

class _CarModeScreenState extends State<CarModeScreen> {
  @override
  void initState() {
    super.initState();
    // Keep device screen awake while driving in Car Mode
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    // Restore normal system overlays upon exiting Car Mode
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<AudioProvider, MusicProvider>(
      builder: (context, audioProvider, musicProvider, child) {
        final currentSong = audioProvider.currentSong;
        final favorites = musicProvider.favorites;

        return Scaffold(
          backgroundColor: const Color(0xFF000000), // Pure OLED black for distraction-free night driving
          body: SafeArea(
            child: Column(
              children: [
                // Top Car Bar: Exit Button, Driving Title & Mic/Voice
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Exit Car Mode
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Colors.white, size: 36),
                        onPressed: () => Navigator.pop(context),
                      ),

                      // Car Mode Indicator
                      Row(
                        children: [
                          const Icon(Icons.directions_car_rounded, color: AppColors.cyan, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'CAR MODE',
                            style: TextStyle(
                              color: AppColors.cyan.withOpacity(0.9),
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.0,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),

                      // Fast Voice Search / Preset Trigger
                      IconButton(
                        icon: const Icon(Icons.mic_rounded, color: Colors.white, size: 32),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Voice Command: "Play Synthwave Drive"'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 1),

                // Large Glanceable Music Artwork
                if (currentSong != null)
                  Container(
                    width: MediaQuery.of(context).size.width * 0.70,
                    height: MediaQuery.of(context).size.width * 0.70,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.15), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.cyan.withOpacity(0.2),
                          blurRadius: 30,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: CachedNetworkImage(
                        imageUrl: currentSong.thumbnail.isNotEmpty
                            ? currentSong.thumbnail
                            : currentSong.fallbackThumbnail,
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.surface,
                          child: const Icon(Icons.music_note, color: AppColors.cyan, size: 80),
                        ),
                      ),
                    ),
                  )
                else
                  const Icon(Icons.music_note, color: Colors.white54, size: 120),

                const SizedBox(height: 24),

                // Large Track Title & Artist (Glanceable in 1 second while driving)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      Text(
                        currentSong?.title ?? 'No Track Playing',
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        currentSong?.artist ?? 'Select a song to start',
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.cyan,
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 1),

                // Giant Distraction-Free Touch Controls
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Big Favorite Button
                      IconButton(
                        icon: Icon(
                          (currentSong?.isFavorite ?? false) ? Icons.favorite : Icons.favorite_border,
                          color: (currentSong?.isFavorite ?? false) ? AppColors.pink : Colors.white70,
                          size: 38,
                        ),
                        onPressed: () {
                          if (currentSong != null) {
                            musicProvider.toggleFavorite(currentSong);
                          }
                        },
                      ),

                      // Massive Previous Button
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.heavyImpact();
                          audioProvider.previousSong();
                        },
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.12),
                          ),
                          child: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 42),
                        ),
                      ),

                      // GIANT Play / Pause Button (Easy to hit without looking)
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.heavyImpact();
                          audioProvider.togglePlayPause();
                        },
                        child: Container(
                          width: 96,
                          height: 96,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.primaryGradient,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.cyan,
                                blurRadius: 30,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Icon(
                            audioProvider.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                            color: Colors.white,
                            size: 58,
                          ),
                        ),
                      ),

                      // Massive Next Button
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.heavyImpact();
                          audioProvider.nextSong();
                        },
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.12),
                          ),
                          child: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 42),
                        ),
                      ),

                      // Shuffle Toggle
                      IconButton(
                        icon: Icon(
                          Icons.shuffle_rounded,
                          color: audioProvider.isShuffle ? AppColors.cyan : Colors.white70,
                          size: 34,
                        ),
                        onPressed: () {
                          HapticFeedback.mediumImpact();
                          audioProvider.toggleShuffle();
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Quick Drive Presets (1-Tap Driving Genres)
                SizedBox(
                  height: 48,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildCarPresetChip(
                        icon: Icons.flash_on_rounded,
                        label: 'Highway Synth',
                        color: AppColors.cyan,
                        onTap: () {
                          final track = musicProvider.allSongs.firstWhere(
                            (s) => s.category.contains('Electronic'),
                            orElse: () => musicProvider.allSongs.first,
                          );
                          audioProvider.playSong(track);
                        },
                      ),
                      _buildCarPresetChip(
                        icon: Icons.nightlife_rounded,
                        label: 'Night Chill',
                        color: AppColors.pink,
                        onTap: () {
                          final track = musicProvider.allSongs.firstWhere(
                            (s) => s.category.contains('Lo-Fi'),
                            orElse: () => musicProvider.allSongs.first,
                          );
                          audioProvider.playSong(track);
                        },
                      ),
                      _buildCarPresetChip(
                        icon: Icons.favorite_rounded,
                        label: 'Shuffle Favorites',
                        color: AppColors.success,
                        onTap: () {
                          if (favorites.isNotEmpty) {
                            final shuffled = List.of(favorites)..shuffle();
                            audioProvider.playSong(shuffled.first, newQueue: shuffled);
                          }
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCarPresetChip({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 6),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.10),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: color.withOpacity(0.4), width: 1.5),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
