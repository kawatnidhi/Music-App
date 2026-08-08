import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/audio_provider.dart';
import '../screens/player_screen.dart';
import '../utils/constants.dart';

class MiniPlayer extends StatelessWidget {
  const MiniPlayer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AudioProvider>(
      builder: (context, audioProvider, child) {
        final currentSong = audioProvider.currentSong;
        if (currentSong == null) {
          return const SizedBox.shrink();
        }

        return GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => const PlayerScreen(),
            );
          },
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1F2643), Color(0xFF131728)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cyan.withOpacity(0.3), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.6),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
                BoxShadow(
                  color: AppColors.cyan.withOpacity(0.12),
                  blurRadius: 15,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Slim Progress Indicator
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: LinearProgressIndicator(
                    value: audioProvider.progressRatio,
                    backgroundColor: Colors.white.withOpacity(0.08),
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.cyan),
                    minHeight: 2.5,
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      // Thumbnail
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: CachedNetworkImage(
                          imageUrl: currentSong.thumbnail.isNotEmpty
                              ? currentSong.thumbnail
                              : currentSong.fallbackThumbnail,
                          width: 46,
                          height: 46,
                          fit: BoxFit.cover,
                          errorWidget: (context, url, error) => Container(
                            width: 46,
                            height: 46,
                            color: AppColors.surface,
                            child: const Icon(Icons.music_note, color: AppColors.cyan),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Title & Artist
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              currentSong.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Text(
                                  currentSong.artist,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'Ad-Free',
                                    style: TextStyle(
                                      color: AppColors.success,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Play/Pause Button
                      IconButton(
                        icon: Icon(
                          audioProvider.isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                          color: AppColors.cyan,
                          size: 36,
                        ),
                        onPressed: () {
                          audioProvider.togglePlayPause();
                        },
                      ),

                      // Next Track Button
                      IconButton(
                        icon: const Icon(Icons.skip_next_rounded, color: AppColors.textPrimary, size: 28),
                        onPressed: () {
                          audioProvider.nextSong();
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
