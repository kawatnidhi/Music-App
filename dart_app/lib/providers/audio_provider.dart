import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import '../models/song.dart';
import '../services/api_service.dart';

class AudioProvider extends ChangeNotifier {
  late AudioPlayer _player;

  Song? _currentSong;
  List<Song> _queue = [];
  int _currentIndex = 0;

  bool _isPlaying = false;
  bool _isBuffering = false;
  bool _isShuffle = false;
  bool _isRepeat = false;

  double _volume = 1.0;
  double _preMuteVolume = 1.0;
  bool _isMuted = false;

  Duration _currentPosition = Duration.zero;
  Duration _totalDuration = const Duration(seconds: 180);
  Duration _bufferedPosition = Duration.zero;

  // Getters
  Song? get currentSong => _currentSong;
  List<Song> get queue => _queue;
  int get currentIndex => _currentIndex;
  bool get isPlaying => _isPlaying;
  bool get isBuffering => _isBuffering;
  bool get isShuffle => _isShuffle;
  bool get isRepeat => _isRepeat;
  double get volume => _volume;
  bool get isMuted => _isMuted;
  Duration get currentPosition => _currentPosition;
  Duration get totalDuration => _totalDuration;
  Duration get bufferedPosition => _bufferedPosition;

  double get progressRatio {
    if (_totalDuration.inMilliseconds == 0) return 0.0;
    return (_currentPosition.inMilliseconds / _totalDuration.inMilliseconds).clamp(0.0, 1.0);
  }

  AudioProvider() {
    _initPlayer();
  }

  void _initPlayer() {
    _player = AudioPlayer();

    // Listen to player state
    _player.playerStateStream.listen((state) {
      _isPlaying = state.playing;
      _isBuffering = state.processingState == ProcessingState.buffering ||
                     state.processingState == ProcessingState.loading;

      if (state.processingState == ProcessingState.completed) {
        if (_isRepeat) {
          _player.seek(Duration.zero);
          _player.play();
        } else {
          nextSong();
        }
      }
      notifyListeners();
    });

    // Listen to position changes
    _player.positionStream.listen((pos) {
      _currentPosition = pos;
      notifyListeners();
    });

    // Listen to buffered position
    _player.bufferedPositionStream.listen((buf) {
      _bufferedPosition = buf;
      notifyListeners();
    });

    // Listen to duration changes
    _player.durationStream.listen((dur) {
      if (dur != null && dur != Duration.zero) {
        _totalDuration = dur;
        notifyListeners();
      }
    });
  }

  // Play a specific song with optional queue
  Future<void> playSong(Song song, {List<Song>? newQueue}) async {
    try {
      if (newQueue != null && newQueue.isNotEmpty) {
        _queue = List<Song>.from(newQueue);
        _currentIndex = _queue.indexWhere((s) => s.id == song.id);
        if (_currentIndex == -1) {
          _queue.insert(0, song);
          _currentIndex = 0;
        }
      } else {
        if (!_queue.any((s) => s.id == song.id)) {
          _queue.add(song);
        }
        _currentIndex = _queue.indexWhere((s) => s.id == song.id);
      }

      _currentSong = song;
      _totalDuration = Duration(seconds: song.duration > 0 ? song.duration : 180);
      _currentPosition = Duration.zero;
      notifyListeners();

      // Resolve stream URL (either direct link or ad-free audio proxy)
      String streamUrl = song.streamUrl;
      if (!streamUrl.startsWith('http')) {
        streamUrl = ApiService.getStreamUrl(song.id);
      }

      await _player.setUrl(streamUrl);
      await _player.play();
    } catch (e) {
      print('AudioProvider.playSong error: $e');
      // If error occurs, fallback to direct audio link
      if (song.originalUrl.isNotEmpty && song.videoId != null) {
        try {
          await _player.setUrl(ApiService.getStreamUrl(song.videoId!));
          await _player.play();
        } catch (_) {}
      }
    }
  }

  // Toggle Play / Pause
  Future<void> togglePlayPause() async {
    if (_currentSong == null && _queue.isNotEmpty) {
      await playSong(_queue[0]);
      return;
    }

    if (_isPlaying) {
      await _player.pause();
    } else {
      await _player.play();
    }
  }

  // Seek position
  Future<void> seek(Duration position) async {
    _currentPosition = position;
    notifyListeners();
    await _player.seek(position);
  }

  // Seek forward 10 seconds
  Future<void> seekForward10() async {
    final target = _currentPosition + const Duration(seconds: 10);
    if (target < _totalDuration) {
      await seek(target);
    } else {
      await seek(_totalDuration);
    }
  }

  // Seek backward 10 seconds
  Future<void> seekBackward10() async {
    final target = _currentPosition - const Duration(seconds: 10);
    if (target > Duration.zero) {
      await seek(target);
    } else {
      await seek(Duration.zero);
    }
  }

  // Next Track
  Future<void> nextSong() async {
    if (_queue.isEmpty) return;

    if (_isShuffle) {
      _currentIndex = (DateTime.now().millisecond) % _queue.length;
    } else {
      _currentIndex = (_currentIndex + 1) % _queue.length;
    }

    await playSong(_queue[_currentIndex]);
  }

  // Previous Track
  Future<void> previousSong() async {
    if (_queue.isEmpty) return;

    if (_currentPosition.inSeconds > 4) {
      await seek(Duration.zero);
      return;
    }

    _currentIndex = (_currentIndex - 1 + _queue.length) % _queue.length;
    await playSong(_queue[_currentIndex]);
  }

  // Set Audio Volume (0.0 to 1.0)
  Future<void> setVolume(double newVolume) async {
    _volume = newVolume.clamp(0.0, 1.0);
    _isMuted = _volume == 0.0;
    notifyListeners();
    await _player.setVolume(_volume);
  }

  // Toggle Mute / Unmute
  Future<void> toggleMute() async {
    if (_isMuted) {
      _volume = _preMuteVolume > 0 ? _preMuteVolume : 0.8;
      _isMuted = false;
    } else {
      _preMuteVolume = _volume;
      _volume = 0.0;
      _isMuted = true;
    }
    notifyListeners();
    await _player.setVolume(_volume);
  }

  // Toggle Shuffle
  void toggleShuffle() {
    _isShuffle = !_isShuffle;
    notifyListeners();
  }

  // Toggle Repeat
  void toggleRepeat() {
    _isRepeat = !_isRepeat;
    notifyListeners();
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }
}
