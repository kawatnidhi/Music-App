import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../providers/audio_provider.dart';
import '../providers/music_provider.dart';
import '../utils/constants.dart';

class SongCard extends StatelessWidget {
  final Song song;
  final List<Song>? playlistContext;

  const SongCard({
    Key? key,
    required this.song,
    this.playlistContext,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final audioProvider = Provider.read<AudioProvider>(context, listen: true);
    final musicProvider = Provider.read<MusicProvider>(context, listen: false);
    final isCurrentSong = audioProvider.currentSong?.id == song.id;
    final isPlaying = isCurrentSong && audioProvider.isPlaying;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: isCurrentSong ? AppColors.cardHover : AppColors.card.withOpacity(0.7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCurrentSong ? AppColors.cyan.withOpacity(0.5) : Colors.white.withOpacity(0.06),
          width: isCurrentSong ? 1.5 : 1,
        ),
        boxShadow: isCurrentSong
            ? [
                BoxShadow(
                  color: AppColors.cyan.withOpacity(0.15),
                  blurRadius: 15,
                  spreadRadius: 1,
                )
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            audioProvider.playSong(song, newQueue: playlistContext);
          },
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                // Music Thumbnail Artwork
                Stack(
                  alignment: Alignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: CachedNetworkImage(
                        imageUrl: song.thumbnail.isNotEmpty ? song.thumbnail : song.fallbackThumbnail,
                        width: 54,
                        height: 54,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          width: 54,
                          height: 54,
                          color: AppColors.surface,
                          child: const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.cyan),
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          width: 54,
                          height: 54,
                          color: AppColors.surface,
                          child: const Icon(Icons.music_note, color: AppColors.textMuted),
                        ),
                      ),
                    ),
                    if (isCurrentSong)
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                          color: AppColors.cyan,
                          size: 30,
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 14),

                // Song Title & Artist
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        song.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: isCurrentSong ? AppColors.cyan : AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              song.artist,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              song.category,
                              style: const TextStyle(
                                color: AppColors.blue,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),

                // Duration & Like Button
                Text(
                  song.durationFormatted,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 6),
                IconButton(
                  icon: Icon(
                    song.isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: song.isFavorite ? AppColors.pink : AppColors.textMuted,
                    size: 20,
                  ),
                  onPressed: () {
                    musicProvider.toggleFavorite(song);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
