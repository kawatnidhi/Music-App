import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../models/song.dart';

class OfflineDownloadService extends ChangeNotifier {
  final Set<String> _downloadedSongIds = {};
  final Map<String, double> _downloadProgress = {};

  Set<String> get downloadedSongIds => _downloadedSongIds;
  Map<String, double> get downloadProgress => _downloadProgress;

  bool isDownloaded(String songId) => _downloadedSongIds.contains(songId);
  bool isDownloading(String songId) => _downloadProgress.containsKey(songId);

  OfflineDownloadService() {
    _scanExistingDownloads();
  }

  // Scan existing offline music files on app startup
  Future<void> _scanExistingDownloads() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final offlineDir = Directory('${dir.path}/offline_music');
      if (await offlineDir.exists()) {
        final files = offlineDir.listSync();
        for (var file in files) {
          if (file is File && file.path.endsWith('.mp3')) {
            final fileName = file.uri.pathSegments.last;
            final songId = fileName.replaceAll('.mp3', '');
            _downloadedSongIds.add(songId);
          }
        }
        notifyListeners();
      }
    } catch (e) {
      print('Error scanning offline downloads: $e');
    }
  }

  // Download a song for 100% offline ad-free playback
  Future<bool> downloadSong(Song song, String streamUrl) async {
    final songId = song.id;
    if (_downloadedSongIds.contains(songId)) return true;

    try {
      _downloadProgress[songId] = 0.1;
      notifyListeners();

      final dir = await getApplicationDocumentsDirectory();
      final offlineDir = Directory('${dir.path}/offline_music');
      if (!await offlineDir.exists()) {
        await offlineDir.create(recursive: true);
      }

      final filePath = '${offlineDir.path}/$songId.mp3';
      final file = File(filePath);

      _downloadProgress[songId] = 0.4;
      notifyListeners();

      final response = await http.get(Uri.parse(streamUrl));
      if (response.statusCode == 200) {
        await file.writeAsBytes(response.bodyBytes);
        _downloadedSongIds.add(songId);
        _downloadProgress.remove(songId);
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Failed to download song offline: $e');
    } finally {
      _downloadProgress.remove(songId);
      notifyListeners();
    }
    return false;
  }

  // Get local file path if offline file exists
  Future<String?> getLocalFilePath(String songId) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/offline_music/$songId.mp3');
      if (await file.exists()) {
        return file.path;
      }
    } catch (_) {}
    return null;
  }

  // Delete downloaded song from phone storage
  Future<void> deleteDownloadedSong(String songId) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/offline_music/$songId.mp3');
      if (await file.exists()) {
        await file.delete();
      }
      _downloadedSongIds.remove(songId);
      notifyListeners();
    } catch (e) {
      print('Error deleting offline song: $e');
    }
  }

  // Calculate total offline storage used
  Future<double> getOfflineStorageSizeMB() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final offlineDir = Directory('${dir.path}/offline_music');
      if (!await offlineDir.exists()) return 0.0;

      int totalBytes = 0;
      final files = offlineDir.listSync(recursive: true);
      for (var f in files) {
        if (f is File) {
          totalBytes += await f.length();
        }
      }
      return double.parse((totalBytes / (1024 * 1024)).toStringAsFixed(1));
    } catch (_) {
      return 0.0;
    }
  }
}
