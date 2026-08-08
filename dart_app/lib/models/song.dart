class Song {
  final String id;
  final String title;
  final String artist;
  final String album;
  final String category;
  final int duration; // in seconds
  final String durationFormatted;
  final String thumbnail;
  final String fallbackThumbnail;
  final String streamUrl;
  final String originalUrl;
  final String? videoId;
  final String sourceType;
  final int plays;
  final int likes;
  final bool isFeatured;
  bool isFavorite;

  Song({
    required this.id,
    required this.title,
    required this.artist,
    required this.album,
    required this.category,
    required this.duration,
    required this.durationFormatted,
    required this.thumbnail,
    required this.fallbackThumbnail,
    required this.streamUrl,
    required this.originalUrl,
    this.videoId,
    required this.sourceType,
    this.plays = 0,
    this.likes = 0,
    this.isFeatured = false,
    this.isFavorite = false,
  });

  factory Song.fromJson(Map<String, dynamic> json) {
    return Song(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Untitled Track',
      artist: json['artist'] ?? 'Unknown Artist',
      album: json['album'] ?? 'Single',
      category: json['category'] ?? 'Trending',
      duration: json['duration'] is int ? json['duration'] : int.tryParse(json['duration']?.toString() ?? '180') ?? 180,
      durationFormatted: json['durationFormatted'] ?? '3:00',
      thumbnail: json['thumbnail'] ?? '',
      fallbackThumbnail: json['fallbackThumbnail'] ?? json['thumbnail'] ?? '',
      streamUrl: json['streamUrl'] ?? '',
      originalUrl: json['originalUrl'] ?? '',
      videoId: json['videoId'],
      sourceType: json['sourceType'] ?? 'youtube',
      plays: json['plays'] ?? 0,
      likes: json['likes'] ?? 0,
      isFeatured: json['isFeatured'] ?? false,
      isFavorite: json['isFavorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'artist': artist,
      'album': album,
      'category': category,
      'duration': duration,
      'durationFormatted': durationFormatted,
      'thumbnail': thumbnail,
      'fallbackThumbnail': fallbackThumbnail,
      'streamUrl': streamUrl,
      'originalUrl': originalUrl,
      'videoId': videoId,
      'sourceType': sourceType,
      'plays': plays,
      'likes': likes,
      'isFeatured': isFeatured,
      'isFavorite': isFavorite,
    };
  }

  Song copyWith({
    String? id,
    String? title,
    String? artist,
    String? album,
    String? category,
    int? duration,
    String? durationFormatted,
    String? thumbnail,
    String? fallbackThumbnail,
    String? streamUrl,
    String? originalUrl,
    String? videoId,
    String? sourceType,
    int? plays,
    int? likes,
    bool? isFeatured,
    bool? isFavorite,
  }) {
    return Song(
      id: id ?? this.id,
      title: title ?? this.title,
      artist: artist ?? this.artist,
      album: album ?? this.album,
      category: category ?? this.category,
      duration: duration ?? this.duration,
      durationFormatted: durationFormatted ?? this.durationFormatted,
      thumbnail: thumbnail ?? this.thumbnail,
      fallbackThumbnail: fallbackThumbnail ?? this.fallbackThumbnail,
      streamUrl: streamUrl ?? this.streamUrl,
      originalUrl: originalUrl ?? this.originalUrl,
      videoId: videoId ?? this.videoId,
      sourceType: sourceType ?? this.sourceType,
      plays: plays ?? this.plays,
      likes: likes ?? this.likes,
      isFeatured: isFeatured ?? this.isFeatured,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
