import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/music_provider.dart';
import '../utils/constants.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<MusicProvider>(
      builder: (context, musicProvider, child) {
        final profile = musicProvider.userProfile;

        return Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'User Profile & Settings',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // User Info Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B2036), Color(0xFF131728)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.primaryGradient,
                          ),
                          child: CircleAvatar(
                            radius: 34,
                            backgroundImage: CachedNetworkImageProvider(
                              profile?.avatar ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                profile?.name ?? 'Alex Rivera',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                profile?.email ?? 'alex.music@example.com',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.success.withOpacity(0.4)),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.shield_outlined, color: AppColors.success, size: 14),
                                    SizedBox(width: 4),
                                    Text(
                                      'AD-FREE PERPETUAL PASS',
                                      style: TextStyle(
                                        color: AppColors.success,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Listening Stats Grid
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatBox(
                          icon: Icons.timer_outlined,
                          color: AppColors.cyan,
                          value: '${profile?.hoursListened ?? 142.5} hrs',
                          label: 'Listened Time',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildStatBox(
                          icon: Icons.music_note,
                          color: AppColors.pink,
                          value: '${profile?.totalPlayed ?? 684}',
                          label: 'Tracks Played',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Settings Header
                  const Text(
                    'Audio & Playback Settings',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),

                  // Audio Quality Selector
                  _buildSettingCard(
                    icon: Icons.graphic_eq_rounded,
                    title: 'Streaming Audio Quality',
                    subtitle: profile?.audioQuality ?? 'High (320 kbps Opus/AAC)',
                    trailing: DropdownButton<String>(
                      dropdownColor: AppColors.card,
                      value: profile?.audioQuality ?? 'High (320 kbps)',
                      style: const TextStyle(color: AppColors.cyan, fontSize: 13),
                      underline: const SizedBox(),
                      items: const [
                        DropdownMenuItem(value: 'High (320 kbps)', child: Text('Ultra (320 kbps)')),
                        DropdownMenuItem(value: 'Standard (192 kbps)', child: Text('Standard (192 kbps)')),
                        DropdownMenuItem(value: 'Data Saver (128 kbps)', child: Text('Data Saver (128 kbps)')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          musicProvider.updateAudioQuality(val);
                        }
                      },
                    ),
                  ),

                  // Sleep Timer
                  _buildSettingCard(
                    icon: Icons.bedtime_outlined,
                    title: 'Sleep Timer',
                    subtitle: profile?.sleepTimerMinutes == 0 ? 'Disabled' : 'Stops in ${profile?.sleepTimerMinutes} mins',
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 16),
                  ),

                  // Theme Switcher
                  _buildSettingCard(
                    icon: Icons.palette_outlined,
                    title: 'App Visual Theme',
                    subtitle: 'Cyberpunk Dark & OLED Glass',
                    trailing: const Icon(Icons.check_circle, color: AppColors.cyan, size: 20),
                  ),

                  // Clear Cache
                  _buildSettingCard(
                    icon: Icons.cleaning_services_outlined,
                    title: 'Clear Streaming Cache',
                    subtitle: '24.8 MB cached (Zero offline lag)',
                    trailing: TextButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Audio stream cache cleared successfully!')),
                        );
                      },
                      child: const Text('Clear', style: TextStyle(color: AppColors.pink)),
                    ),
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatBox({
    required IconData icon,
    required Color color,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.cyan, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}
