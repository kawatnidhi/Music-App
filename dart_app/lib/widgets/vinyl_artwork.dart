import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/constants.dart';

class VinylArtwork extends StatefulWidget {
  final String imageUrl;
  final bool isPlaying;
  final double size;

  const VinylArtwork({
    Key? key,
    required this.imageUrl,
    required this.isPlaying,
    this.size = 280,
  }) : super(key: key);

  @override
  State<VinylArtwork> createState() => _VinylArtworkState();
}

class _VinylArtworkState extends State<VinylArtwork> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    );

    if (widget.isPlaying) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant VinylArtwork oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying != oldWidget.isPlaying) {
      if (widget.isPlaying) {
        _controller.repeat();
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.rotate(
            angle: _controller.value * 2 * math.pi,
            child: child,
          );
        },
        child: Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const RadialGradient(
              colors: [
                Color(0xFF0F121E),
                Color(0xFF1E2438),
                Color(0xFF0A0C16),
              ],
              stops: [0.3, 0.7, 1.0],
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.cyan.withOpacity(0.3),
                blurRadius: 30,
                spreadRadius: 2,
              ),
              BoxShadow(
                color: AppColors.pink.withOpacity(0.2),
                blurRadius: 40,
                spreadRadius: -5,
              ),
            ],
            border: Border.all(color: Colors.white.withOpacity(0.15), width: 3),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Vinyl grooves
              Container(
                width: widget.size * 0.85,
                height: widget.size * 0.85,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.05), width: 2),
                ),
              ),
              Container(
                width: widget.size * 0.7,
                height: widget.size * 0.7,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.05), width: 2),
                ),
              ),

              // Center Music Artwork
              ClipOval(
                child: CachedNetworkImage(
                  imageUrl: widget.imageUrl,
                  width: widget.size * 0.52,
                  height: widget.size * 0.52,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => Container(
                    width: widget.size * 0.52,
                    height: widget.size * 0.52,
                    color: AppColors.surface,
                    child: const Icon(Icons.music_note, color: AppColors.cyan, size: 40),
                  ),
                ),
              ),

              // Center Vinyl Spindle Hole
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.background,
                  border: Border.all(color: AppColors.cyan, width: 2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
