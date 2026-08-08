import 'song.dart';

class Playlist {
  final String id;
  final String title;
  final String description;
  final String thumbnail;
  final List<String> songIds;
  final List<Song> songs;
  final int songCount;
  final DateTime? createdAt;

  Playlist({
    required this.id,
    required this.title,
    required this.description,
    required this.thumbnail,
    required this.songIds,
    this.songs = const [],
    this.songCount = 0,
    this.createdAt,
  });

  factory Playlist.fromJson(Map<String, dynamic> json) {
    var rawSongs = json['songs'] as List<dynamic>? ?? [];
    List<Song> parsedSongs = rawSongs.map((s) => Song.fromJson(s as Map<String, dynamic>)).toList();

    var rawIds = json['songIds'] as List<dynamic>? ?? [];
    List<String> parsedIds = rawIds.map((id) => id.toString()).toList();

    return Playlist(
      id: json['id'] ?? '',
      title: json['title'] ?? 'My Playlist',
      description: json['description'] ?? '',
      thumbnail: json['thumbnail'] ?? '',
      songIds: parsedIds,
      songs: parsedSongs,
      songCount: json['songCount'] ?? parsedIds.length,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'thumbnail': thumbnail,
      'songIds': songIds,
      'songCount': songCount,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
