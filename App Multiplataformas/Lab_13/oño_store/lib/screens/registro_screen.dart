import 'package:flutter/cupertino.dart';

import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';
import 'main_tabs.dart';

class RegistroScreen extends StatefulWidget {
  const RegistroScreen({super.key});

  @override
  State<RegistroScreen> createState() => _RegistroScreenState();
}

class _RegistroScreenState extends State<RegistroScreen> {
  final _usuario = TextEditingController();
  final _correo = TextEditingController();
  final _password = TextEditingController();
  final _confirmar = TextEditingController();

  @override
  void dispose() {
    _usuario.dispose();
    _correo.dispose();
    _password.dispose();
    _confirmar.dispose();
    super.dispose();
  }

  void _alerta(String titulo, String mensaje) {
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: Text(titulo),
        content: Text(mensaje),
        actions: [
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  void _crearCuenta() {
    if (_usuario.text.trim().isEmpty ||
        _correo.text.trim().isEmpty ||
        _password.text.isEmpty) {
      _alerta('Faltan datos', 'Completa todos los campos para crear tu cuenta.');
      return;
    }
    if (_password.text != _confirmar.text) {
      _alerta('Contrasenas distintas', 'Las contrasenas no coinciden. Intentalo de nuevo.');
      return;
    }
    Navigator.of(context).pushAndRemoveUntil(
      CupertinoPageRoute(builder: (_) => const MainTabs()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: Fk.bg0,
      child: AuroraBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Cabecera translucida con boton de retroceso.
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Row(
                  children: [
                    Pressable(
                      onPressed: () => Navigator.pop(context),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(11),
                        radius: 16,
                        child: const Icon(CupertinoIcons.back, color: Fk.text, size: 22),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Text(
                      'Crear cuenta',
                      style: TextStyle(
                        color: Fk.text,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Unete al club',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Fk.text,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Crea tu perfil y empieza a coleccionar Pops',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Fk.textMuted, fontSize: 15),
                      ),
                      const SizedBox(height: 28),
                      GlassPanel(
                        padding: const EdgeInsets.all(22),
                        glowColor: Fk.cyan,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            GlassTextField(
                              label: 'Usuario',
                              placeholder: 'coleccionista_01',
                              icon: CupertinoIcons.person_fill,
                              controller: _usuario,
                            ),
                            const SizedBox(height: 16),
                            GlassTextField(
                              label: 'Correo',
                              placeholder: 'tu@correo.com',
                              icon: CupertinoIcons.mail_solid,
                              controller: _correo,
                              keyboardType: TextInputType.emailAddress,
                            ),
                            const SizedBox(height: 16),
                            GlassTextField(
                              label: 'Contrasena',
                              placeholder: '********',
                              icon: CupertinoIcons.lock_fill,
                              controller: _password,
                              obscure: true,
                            ),
                            const SizedBox(height: 16),
                            GlassTextField(
                              label: 'Confirmar contrasena',
                              placeholder: '********',
                              icon: CupertinoIcons.lock_shield_fill,
                              controller: _confirmar,
                              obscure: true,
                            ),
                            const SizedBox(height: 26),
                            GlowButton(
                              label: 'CREAR CUENTA',
                              icon: CupertinoIcons.sparkles,
                              gradient: Fk.brandWarm,
                              glowColor: Fk.pink,
                              onPressed: _crearCuenta,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
