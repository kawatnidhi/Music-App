import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/music_provider.dart';
import '../providers/audio_provider.dart';
import '../widgets/song_card.dart';
import '../utils/constants.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer2<MusicProvider, AudioProvider>(
      builder: (context, musicProvider, audioProvider, child) {
        if (musicProvider.isLoading) {
          return const Scaffold(
            backgroundColor: AppColors.background,
            body: Center(
              child: CircularProgressIndicator(color: AppColors.cyan),
            ),
          );
        }

        final featuredSongs = musicProvider.featuredSongs;
        final songsToDisplay = musicProvider.filteredSongs;

        return Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: RefreshIndicator(
              color: AppColors.cyan,
              backgroundColor: AppColors.card,
              onRefresh: () => musicProvider.loadAllData(),
              child: CustomScrollView(
                slivers: [
                  // Top App Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'SoundVault 2077',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: AppColors.success,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    '100% Ad-Free Audio Stream',
                                    style: TextStyle(
                                      color: AppColors.success,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),

                          // Profile Avatar
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: AppColors.primaryGradient,
                            ),
                            child: const CircleAvatar(
                              radius: 20,
                              backgroundImage: CachedNetworkImageProvider(
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Search Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                        ),
                        child: TextField(
                          style: const TextStyle(color: AppColors.textPrimary),
                          onChanged: (val) => musicProvider.setSearchQuery(val),
                          decoration: InputDecoration(
                            hintText: 'Search songs, artists, or genres...',
                            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                            prefixIcon: const Icon(Icons.search, color: AppColors.cyan, size: 22),
                            suffixIcon: musicProvider.searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, color: AppColors.textMuted, size: 18),
                                    onPressed: () => musicProvider.setSearchQuery(''),
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Featured Banner Carousel
                  if (featuredSongs.isNotEmpty && musicProvider.searchQuery.isEmpty)
                    SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.fromLTRB(20, 20, 20, 10),
                            child: Text(
                              'Featured & Trending',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 180,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: featuredSongs.length,
                              itemBuilder: (context, index) {
                                final song = featuredSongs[index];
                                return GestureDetector(
                                  onTap: () => audioProvider.playSong(song, newQueue: featuredSongs),
                                  child: Container(
                                    width: 280,
                                    margin: const EdgeInsets.symmetric(horizontal: 6),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(18),
                                      image: DecorationImage(
                                        image: CachedNetworkImageProvider(song.thumbnail),
                                        fit: BoxFit.cover,
                                        colorFilter: ColorFilter.mode(
                                          Colors.black.withOpacity(0.45),
                                          BlendMode.darken,
                                        ),
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.4),
                                          blurRadius: 15,
                                          offset: const Offset(0, 8),
                                        ),
                                      ],
                                    ),
                                    child: Stack(
                                      children: [
                                        // Gradient overlay
                                        Container(
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(18),
                                            gradient: LinearGradient(
                                              colors: [
                                                Colors.transparent,
                                                Colors.black.withOpacity(0.85),
                                              ],
                                              begin: Alignment.topCenter,
                                              end: Alignment.bottomCenter,
                                            ),
                                          ),
                                        ),

                                        // Badge
                                        Positioned(
                                          top: 14,
                                          left: 14,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: AppColors.cyan.withOpacity(0.85),
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            child: const Text(
                                              '🔥 TRENDING',
                                              style: TextStyle(
                                                color: Colors.black,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ),
                                        ),

                                        // Play Icon
                                        Positioned(
                                          right: 14,
                                          bottom: 14,
                                          child: Container(
                                            width: 44,
                                            height: 44,
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              gradient: AppColors.primaryGradient,
                                            ),
                                            child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 28),
                                          ),
                                        ),

                                        // Title & Artist
                                        Positioned(
                                          left: 14,
                                          bottom: 14,
                                          right: 64,
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                song.title,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                song.artist,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: AppColors.textSecondary,
                                                  fontSize: 13,
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
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Genre / Category Filter Pills
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: SizedBox(
                        height: 38,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: musicProvider.categories.length,
                          itemBuilder: (context, index) {
                            final cat = musicProvider.categories[index];
                            final isSelected = musicProvider.selectedCategory == cat;

                            return GestureDetector(
                              onTap: () => musicProvider.selectCategory(cat),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: const EdgeInsets.symmetric(horizontal: 4),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: isSelected ? AppColors.primaryGradient : null,
                                  color: isSelected ? null : AppColors.surface,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? Colors.transparent : Colors.white.withOpacity(0.08),
                                  ),
                                ),
                                child: Text(
                                  cat,
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : AppColors.textSecondary,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),

                  // Recently Uploaded by Admin / All Songs Header
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 6, 20, 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            musicProvider.selectedCategory == 'Trending'
                                ? 'Recently Uploaded Music'
                                : '${musicProvider.selectedCategory} Tracks',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${songsToDisplay.length} songs',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Songs List
                  if (songsToDisplay.isEmpty)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Center(
                          child: Text(
                            'No tracks found matching your query.',
                            style: TextStyle(color: AppColors.textMuted),
                          ),
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final song = songsToDisplay[index];
                          return SongCard(song: song, playlistContext: songsToDisplay);
                        },
                        childCount: songsToDisplay.length,
                      ),
                    ),

                  // Bottom padding for persistent MiniPlayer
                  const SliverToBoxAdapter(
                    child: SizedBox(height: 100),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
