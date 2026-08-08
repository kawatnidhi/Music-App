import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/audio_provider.dart';
import '../providers/music_provider.dart';
import '../widgets/vinyl_artwork.dart';
import 'car_mode_screen.dart';
import '../utils/constants.dart';

class PlayerScreen extends StatelessWidget {
  const PlayerScreen({Key? key}) : super(key: key);

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<AudioProvider, MusicProvider>(
      builder: (context, audioProvider, musicProvider, child) {
        final currentSong = audioProvider.currentSong;
        if (currentSong == null) {
          return const Scaffold(
            backgroundColor: AppColors.background,
            body: Center(child: Text('No song currently loaded')),
          );
        }

        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1E1430), Color(0xFF0F121E), Color(0xFF0A0C16)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Scaffold(
            backgroundColor: Colors.transparent,
            appBar: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 32),
                onPressed: () => Navigator.pop(context),
              ),
              centerTitle: true,
              title: Column(
                children: [
                  const Text(
                    'PLAYING AD-FREE AUDIO',
                    style: TextStyle(
                      color: AppColors.success,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    currentSong.category,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.queue_music_rounded, color: Colors.white),
                  onPressed: () {
                    // Show Queue bottom sheet
                    _showQueueSheet(context, audioProvider);
                  },
                ),
              ],
            ),
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Rotating Vinyl Artwork
                    VinylArtwork(
                      imageUrl: currentSong.thumbnail.isNotEmpty ? currentSong.thumbnail : currentSong.fallbackThumbnail,
                      isPlaying: audioProvider.isPlaying,
                      size: MediaQuery.of(context).size.width * 0.72,
                    ),

                    // Title, Artist and Like Button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                currentSong.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                currentSong.artist,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.cyan,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            currentSong.isFavorite ? Icons.favorite : Icons.favorite_border,
                            color: currentSong.isFavorite ? AppColors.pink : AppColors.textMuted,
                            size: 28,
                          ),
                          onPressed: () {
                            musicProvider.toggleFavorite(currentSong);
                          },
                        ),
                      ],
                    ),

                    // Interactive Seekbar & Timers
                    Column(
                      children: [
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            activeTrackColor: AppColors.cyan,
                            inactiveTrackColor: Colors.white.withOpacity(0.12),
                            thumbColor: Colors.white,
                            trackHeight: 4,
                            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          ),
                          child: Slider(
                            value: audioProvider.currentPosition.inSeconds.toDouble().clamp(
                              0.0,
                              audioProvider.totalDuration.inSeconds.toDouble() > 0
                                  ? audioProvider.totalDuration.inSeconds.toDouble()
                                  : 180.0,
                            ),
                            max: audioProvider.totalDuration.inSeconds.toDouble() > 0
                                ? audioProvider.totalDuration.inSeconds.toDouble()
                                : 180.0,
                            onChanged: (val) {
                              audioProvider.seek(Duration(seconds: val.toInt()));
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _formatDuration(audioProvider.currentPosition),
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                              ),
                              Text(
                                _formatDuration(audioProvider.totalDuration),
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    // Main Controls: Shuffle, Prev, Play/Pause, Next, Repeat
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.shuffle_rounded,
                            color: audioProvider.isShuffle ? AppColors.cyan : AppColors.textMuted,
                            size: 24,
                          ),
                          onPressed: () => audioProvider.toggleShuffle(),
                        ),
                        IconButton(
                          icon: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 36),
                          onPressed: () => audioProvider.previousSong(),
                        ),

                        // Play/Pause Big Button
                        GestureDetector(
                          onTap: () => audioProvider.togglePlayPause(),
                          child: Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: AppColors.primaryGradient,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.cyan.withOpacity(0.4),
                                  blurRadius: 20,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Icon(
                              audioProvider.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: 38,
                            ),
                          ),
                        ),

                        IconButton(
                          icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 36),
                          onPressed: () => audioProvider.nextSong(),
                        ),
                        IconButton(
                          icon: Icon(
                            audioProvider.isRepeat ? Icons.repeat_one_rounded : Icons.repeat_rounded,
                            color: audioProvider.isRepeat ? AppColors.cyan : AppColors.textMuted,
                            size: 24,
                          ),
                          onPressed: () => audioProvider.toggleRepeat(),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showQueueSheet(BuildContext context, AudioProvider audioProvider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Up Next in Queue',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: audioProvider.queue.length,
                itemBuilder: (context, index) {
                  final song = audioProvider.queue[index];
                  final isCurrent = song.id == audioProvider.currentSong?.id;

                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(song.thumbnail, width: 44, height: 44, fit: BoxFit.cover),
                    ),
                    title: Text(
                      song.title,
                      maxLines: 1,
                      style: TextStyle(
                        color: isCurrent ? AppColors.cyan : Colors.white,
                        fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    subtitle: Text(song.artist, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    trailing: isCurrent ? const Icon(Icons.graphic_eq_rounded, color: AppColors.cyan) : null,
                    onTap: () {
                      audioProvider.playSong(song);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
