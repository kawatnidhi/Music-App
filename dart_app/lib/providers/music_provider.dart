import 'package:flutter/foundation.dart';
import '../models/song.dart';
import '../models/playlist.dart';
import '../models/user_profile.dart';
import '../services/api_service.dart';

class MusicProvider extends ChangeNotifier {
  List<Song> _allSongs = [];
  List<String> _categories = [];
  List<Song> _favorites = [];
  List<Playlist> _playlists = [];
  UserProfile? _userProfile;

  String _selectedCategory = 'Trending';
  String _searchQuery = '';
  bool _isLoading = false;

  // Getters
  List<Song> get allSongs => _allSongs;
  List<String> get categories => _categories;
  List<Song> get favorites => _favorites;
  List<Playlist> get playlists => _playlists;
  UserProfile? get userProfile => _userProfile;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;

  List<Song> get featuredSongs => _allSongs.where((s) => s.isFeatured).toList();

  List<Song> get filteredSongs {
    var list = [..._allSongs];

    if (_selectedCategory != 'All' && _selectedCategory != 'Trending') {
      list = list.where((s) => s.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
    }

    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((s) =>
        s.title.toLowerCase().contains(q) ||
        s.artist.toLowerCase().contains(q) ||
        s.album.toLowerCase().contains(q) ||
        s.category.toLowerCase().contains(q)
      ).toList();
    }

    return list;
  }

  MusicProvider() {
    loadAllData();
  }

  Future<void> loadAllData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getSongs(),
        ApiService.getCategories(),
        ApiService.getFavorites(),
        ApiService.getPlaylists(),
        ApiService.getUserProfile(),
      ]);

      _allSongs = results[0] as List<Song>;
      _categories = results[1] as List<String>;
      _favorites = results[2] as List<Song>;
      _playlists = results[3] as List<Playlist>;
      _userProfile = results[4] as UserProfile?;

      // Sync favorite flags in allSongs
      final favIds = _favorites.map((f) => f.id).toSet();
      for (var s in _allSongs) {
        s.isFavorite = favIds.contains(s.id);
      }
    } catch (e) {
      print('MusicProvider.loadAllData error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> toggleFavorite(Song song) async {
    final newFavState = !song.isFavorite;
    song.isFavorite = newFavState;

    if (newFavState) {
      if (!_favorites.any((f) => f.id == song.id)) {
        _favorites.insert(0, song);
      }
    } else {
      _favorites.removeWhere((f) => f.id == song.id);
    }
    notifyListeners();

    // Sync with backend API
    await ApiService.toggleFavorite(song.id);
  }

  Future<void> createPlaylist(String title, String description) async {
    final pl = await ApiService.createPlaylist(title, description);
    if (pl != null) {
      _playlists.insert(0, pl);
      notifyListeners();
    }
  }

  Future<void> updateUserTheme(String theme) async {
    if (_userProfile != null) {
      _userProfile = _userProfile!.copyWith(theme: theme);
      notifyListeners();
      await ApiService.updateProfile({'theme': theme});
    }
  }

  Future<void> updateAudioQuality(String quality) async {
    if (_userProfile != null) {
      _userProfile = _userProfile!.copyWith(audioQuality: quality);
      notifyListeners();
      await ApiService.updateProfile({'audioQuality': quality});
    }
  }
}
