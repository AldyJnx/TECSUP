// Verifica que cada pantalla renderice sin overflow a tamano de movil.

import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pop_vault/data/productos.dart';
import 'package:pop_vault/state/carrito.dart';
import 'package:pop_vault/theme/app_theme.dart';
import 'package:pop_vault/screens/login_screen.dart';
import 'package:pop_vault/screens/registro_screen.dart';
import 'package:pop_vault/screens/home_screen.dart';
import 'package:pop_vault/screens/detalle_screen.dart';
import 'package:pop_vault/screens/inventario_screen.dart';
import 'package:pop_vault/screens/perfil_screen.dart';

// Envoltorio que replica el tema oscuro de main.dart.
Widget _app(Widget home) {
  return CupertinoApp(
    theme: const CupertinoThemeData(
      brightness: Brightness.dark,
      primaryColor: Fk.violet,
      scaffoldBackgroundColor: Fk.bg0,
      textTheme: CupertinoTextThemeData(
        textStyle: TextStyle(color: Fk.text, fontSize: 16),
      ),
    ),
    home: home,
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  void usarPantallaMovil(WidgetTester tester) {
    tester.view.physicalSize = const Size(1170, 2532); // iPhone ~390x844 @3x
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
  }

  Future<void> verificarSinOverflow(WidgetTester tester, Widget pantalla) async {
    await tester.pumpWidget(_app(pantalla));
    await tester.pump(const Duration(milliseconds: 300));
    expect(tester.takeException(), isNull);
  }

  tearDown(Carrito.instance.vaciar);

  testWidgets('Login renderiza sin overflow', (tester) async {
    usarPantallaMovil(tester);
    await verificarSinOverflow(tester, const LoginScreen());
  });

  testWidgets('Registro renderiza sin overflow', (tester) async {
    usarPantallaMovil(tester);
    await verificarSinOverflow(tester, const RegistroScreen());
  });

  testWidgets('Home (grilla de productos) sin overflow', (tester) async {
    usarPantallaMovil(tester);
    await verificarSinOverflow(tester, const HomeScreen());
  });

  testWidgets('Detalle de cada producto sin overflow', (tester) async {
    usarPantallaMovil(tester);
    for (final p in kProductos) {
      await verificarSinOverflow(tester, DetalleScreen(producto: p));
    }
  });

  testWidgets('Carrito vacio sin overflow', (tester) async {
    usarPantallaMovil(tester);
    await verificarSinOverflow(tester, const InventarioScreen());
  });

  testWidgets('Carrito con items sin overflow', (tester) async {
    usarPantallaMovil(tester);
    for (final p in kProductos) {
      Carrito.instance.agregar(p);
    }
    await verificarSinOverflow(tester, const InventarioScreen());
  });

  testWidgets('Perfil sin overflow', (tester) async {
    usarPantallaMovil(tester);
    for (final p in kProductos.take(3)) {
      Carrito.instance.agregar(p);
    }
    await verificarSinOverflow(tester, const PerfilScreen());
  });
}
