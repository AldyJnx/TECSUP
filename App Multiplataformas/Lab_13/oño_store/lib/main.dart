import 'package:flutter/cupertino.dart';

import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

void main() => runApp(const PopVaultApp());

class PopVaultApp extends StatelessWidget {
  const PopVaultApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      title: 'POP VAULT',
      debugShowCheckedModeBanner: false,
      theme: const CupertinoThemeData(
        brightness: Brightness.dark,
        primaryColor: Fk.violet,
        scaffoldBackgroundColor: Fk.bg0,
        barBackgroundColor: Color(0x00000000),
        textTheme: CupertinoTextThemeData(
          textStyle: TextStyle(color: Fk.text, fontSize: 16),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
