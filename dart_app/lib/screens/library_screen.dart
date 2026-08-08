import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/music_provider.dart';
import '../providers/audio_provider.dart';
import '../widgets/song_card.dart';
import '../utils/constants.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({Key? key}) : super(key: key);

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showCreatePlaylistDialog(BuildContext context, MusicProvider musicProvider) {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        title: const Text(
          'Create New Playlist',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Playlist Name (e.g. Cyber Lo-Fi)',
                hintStyle: const TextStyle(color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Description (optional)',
                hintStyle: const TextStyle(color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.cyan,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              if (titleController.text.trim().isNotEmpty) {
                musicProvider.createPlaylist(titleController.text.trim(), descController.text.trim());
                Navigator.pop(context);
              }
            },
            child: const Text('Create', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<MusicProvider, AudioProvider>(
      builder: (context, musicProvider, audioProvider, child) {
        final playlists = musicProvider.playlists;
        final allSongs = musicProvider.allSongs;

        return Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Your Music Library',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_box_rounded, color: AppColors.cyan, size: 28),
                        onPressed: () => _showCreatePlaylistDialog(context, musicProvider),
                      ),
                    ],
                  ),
                ),

                // Tab Bar
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: AppColors.textMuted,
                    labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    tabs: const [
                      Tab(text: 'Playlists'),
                      Tab(text: 'History'),
                      Tab(text: 'Downloads'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Tab Views
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // 1. Playlists Tab
                      playlists.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.queue_music_rounded, size: 48, color: AppColors.textMuted),
                                  const SizedBox(height: 12),
                                  const Text('No playlists yet', style: TextStyle(color: AppColors.textSecondary)),
                                  const SizedBox(height: 8),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.cyan,
                                      foregroundColor: Colors.black,
                                    ),
                                    onPressed: () => _showCreatePlaylistDialog(context, musicProvider),
                                    child: const Text('Create Playlist'),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                              itemCount: playlists.length,
                              itemBuilder: (context, index) {
                                final pl = playlists[index];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.card,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                                  ),
                                  child: Row(
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(10),
                                        child: CachedNetworkImage(
                                          imageUrl: pl.thumbnail,
                                          width: 60,
                                          height: 60,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              pl.title,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              '${pl.songCount} ad-free tracks • Playlist',
                                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.play_circle_fill, color: AppColors.cyan, size: 36),
                                        onPressed: () {
                                          if (pl.songs.isNotEmpty) {
                                            audioProvider.playSong(pl.songs.first, newQueue: pl.songs);
                                          } else if (allSongs.isNotEmpty) {
                                            audioProvider.playSong(allSongs.first, newQueue: allSongs);
                                          }
                                        },
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),

                      // 2. Listening History Tab
                      allSongs.isEmpty
                          ? const Center(
                              child: Text('No listening history yet', style: TextStyle(color: AppColors.textMuted)),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.only(bottom: 100),
                              itemCount: allSongs.length > 8 ? 8 : allSongs.length,
                              itemBuilder: (context, index) {
                                return SongCard(song: allSongs[index], playlistContext: allSongs);
                              },
                            ),

                      // 3. Offline Cache Tab
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
                              ),
                              child: const Icon(Icons.offline_bolt_rounded, size: 48, color: AppColors.cyan),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Smart Offline Buffering Active',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 40),
                              child: Text(
                                'Tracks you stream are cached locally for zero-latency, ad-free replay even with poor connection.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
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
