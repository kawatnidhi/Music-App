import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/music_provider.dart';
import 'providers/audio_provider.dart';
import 'screens/main_navigation.dart';
import 'utils/constants.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.surface,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const AdFreeMusicApp());
}

class AdFreeMusicApp extends StatelessWidget {
  const AdFreeMusicApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MusicProvider()),
        ChangeNotifierProvider(create: (_) => AudioProvider()),
      ],
      child: MaterialApp(
        title: 'SoundVault 2077 - Ad-Free Music',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: AppColors.background,
          primaryColor: AppColors.cyan,
          textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
          colorScheme: const ColorScheme.dark(
            primary: AppColors.cyan,
            secondary: AppColors.pink,
            surface: AppColors.surface,
            background: AppColors.background,
          ),
          useMaterial3: true,
        ),
        home: const MainNavigationScreen(),
      ),
    );
  }
}
