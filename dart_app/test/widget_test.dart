import 'package:flutter_test/flutter_test.dart';
import 'package:ad_free_music_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AdFreeMusicApp());
    expect(find.byType(AdFreeMusicApp), findsOneWidget);
  });
}
