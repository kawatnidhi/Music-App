import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF0A0C16);
  static const Color surface = Color(0xFF131728);
  static const Color card = Color(0xFF1B2036);
  static const Color cardHover = Color(0xFF242C4C);

  static const Color cyan = Color(0xFF00F2FE);
  static const Color blue = Color(0xFF4FACFE);
  static const Color pink = Color(0xFFF857A6);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF00F2FE), Color(0xFF4FACFE), Color(0xFFF857A6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1B2036), Color(0xFF131728)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

class AppStyles {
  static BoxDecoration glassCard = BoxDecoration(
    color: AppColors.card.withOpacity(0.85),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: Colors.white.withOpacity(0.08), width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.3),
        blurRadius: 15,
        offset: const Offset(0, 8),
      ),
    ],
  );

  static BoxDecoration glowBox(Color glowColor) => BoxDecoration(
    boxShadow: [
      BoxShadow(
        color: glowColor.withOpacity(0.35),
        blurRadius: 20,
        spreadRadius: 2,
      ),
    ],
  );
}
