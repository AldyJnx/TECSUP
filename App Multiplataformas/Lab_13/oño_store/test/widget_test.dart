// Smoke test de la app POP VAULT.

import 'package:flutter_test/flutter_test.dart';

import 'package:pop_vault/main.dart';

void main() {
  testWidgets('La app arranca en la pantalla de login', (WidgetTester tester) async {
    await tester.pumpWidget(const PopVaultApp());

    // El wordmark y el boton de ingreso deben estar presentes.
    expect(find.text('POP VAULT'), findsOneWidget);
    expect(find.text('ENTRAR A LA BOVEDA'), findsOneWidget);
  });
}
