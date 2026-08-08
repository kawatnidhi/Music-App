import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/song.dart';
import '../models/playlist.dart';
import '../models/user_profile.dart';

class ApiService {
  // Live Cloud Streaming Engine on Render
  static String baseUrl = 'https://soundvault-music-engine.onrender.com/api';

  // Call this to switch to custom URL or local emulator if needed
  static void setCloudProductionUrl(String renderDomain) {
    baseUrl = renderDomain.endsWith('/api') ? renderDomain : '$renderDomain/api';
  }

  static String getStreamUrl(String songId) {
    return '$baseUrl/songs/stream/$songId';
  }

  // Fetch all songs
  static Future<List<Song>> getSongs({String? category, String? search, bool featured = false}) async {
    try {
      final queryParams = <String, String>{};
      if (category != null && category != 'All' && category != 'Trending') {
        queryParams['category'] = category;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (featured) {
        queryParams['featured'] = 'true';
      }

      final uri = Uri.parse('$baseUrl/songs').replace(queryParameters: queryParams);
      final response = await http.get(uri).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['songs'] != null) {
          final List list = data['songs'];
          return list.map((json) => Song.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      print('ApiService.getSongs error: $e');
      return [];
    }
  }

  // Fetch categories
  static Future<List<String>> getCategories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/songs/categories')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['categories'] != null) {
          return List<String>.from(data['categories']);
        }
      }
      return [
        'Trending',
        'Lo-Fi & Chill',
        'Pop & Hits',
        'Electronic & Dance',
        'Hip-Hop & Rap',
        'Acoustic & Indie',
        'Rock & Metal',
        'Focus & Study'
      ];
    } catch (e) {
      return ['Trending', 'Lo-Fi & Chill', 'Pop & Hits', 'Electronic & Dance', 'Hip-Hop & Rap', 'Acoustic & Indie'];
    }
  }

  // Fetch Favorites
  static Future<List<Song>> getFavorites() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/favorites')).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['favorites'] != null) {
          final List list = data['favorites'];
          return list.map((json) => Song.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      print('ApiService.getFavorites error: $e');
      return [];
    }
  }

  // Toggle Favorite
  static Future<bool?> toggleFavorite(String songId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/favorites/toggle'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'songId': songId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['isFavorite'] as bool?;
      }
      return null;
    } catch (e) {
      print('ApiService.toggleFavorite error: $e');
      return null;
    }
  }

  // Fetch Playlists
  static Future<List<Playlist>> getPlaylists() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/playlists')).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['playlists'] != null) {
          final List list = data['playlists'];
          return list.map((json) => Playlist.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      print('ApiService.getPlaylists error: $e');
      return [];
    }
  }

  // Create Playlist
  static Future<Playlist?> createPlaylist(String title, String description) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/playlists'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'title': title,
          'description': description,
          'thumbnail': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        }),
      );
      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['playlist'] != null) {
          return Playlist.fromJson(data['playlist']);
        }
      }
      return null;
    } catch (e) {
      print('ApiService.createPlaylist error: $e');
      return null;
    }
  }

  // Fetch User Profile
  static Future<UserProfile?> getUserProfile() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/profile')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['profile'] != null) {
          return UserProfile.fromJson(data['profile']);
        }
      }
      return null;
    } catch (e) {
      print('ApiService.getUserProfile error: $e');
      return null;
    }
  }

  // Update Profile
  static Future<UserProfile?> updateProfile(Map<String, dynamic> updates) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/profile'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(updates),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['profile'] != null) {
          return UserProfile.fromJson(data['profile']);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
