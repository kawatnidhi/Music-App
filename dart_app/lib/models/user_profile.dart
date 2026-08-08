class UserProfile {
  final String id;
  final String name;
  final String email;
  final String avatar;
  final String plan;
  final bool isAdFreeActive;
  final double hoursListened;
  final int totalPlayed;
  final int favoritesCount;
  final int playlistsCount;
  final String audioQuality;
  final int sleepTimerMinutes;
  final String theme;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.avatar,
    this.plan = 'Ad-Free Premium',
    this.isAdFreeActive = true,
    this.hoursListened = 0.0,
    this.totalPlayed = 0,
    this.favoritesCount = 0,
    this.playlistsCount = 0,
    this.audioQuality = 'High (320 kbps)',
    this.sleepTimerMinutes = 0,
    this.theme = 'dark_cyberpunk',
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? 'user-001',
      name: json['name'] ?? 'Alex Rivera',
      email: json['email'] ?? 'alex.music@example.com',
      avatar: json['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      plan: json['plan'] ?? 'Ad-Free Premium',
      isAdFreeActive: json['isAdFreeActive'] ?? true,
      hoursListened: (json['hoursListened'] is num) ? (json['hoursListened'] as num).toDouble() : 0.0,
      totalPlayed: json['totalPlayed'] ?? 0,
      favoritesCount: json['favoritesCount'] ?? 0,
      playlistsCount: json['playlistsCount'] ?? 0,
      audioQuality: json['audioQuality'] ?? 'High (320 kbps)',
      sleepTimerMinutes: json['sleepTimerMinutes'] ?? 0,
      theme: json['theme'] ?? 'dark_cyberpunk',
    );
  }

  UserProfile copyWith({
    String? name,
    String? email,
    String? avatar,
    String? audioQuality,
    int? sleepTimerMinutes,
    String? theme,
    double? hoursListened,
    int? totalPlayed,
    int? favoritesCount,
    int? playlistsCount,
  }) {
    return UserProfile(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      plan: plan,
      isAdFreeActive: isAdFreeActive,
      hoursListened: hoursListened ?? this.hoursListened,
      totalPlayed: totalPlayed ?? this.totalPlayed,
      favoritesCount: favoritesCount ?? this.favoritesCount,
      playlistsCount: playlistsCount ?? this.playlistsCount,
      audioQuality: audioQuality ?? this.audioQuality,
      sleepTimerMinutes: sleepTimerMinutes ?? this.sleepTimerMinutes,
      theme: theme ?? this.theme,
    );
  }
}
