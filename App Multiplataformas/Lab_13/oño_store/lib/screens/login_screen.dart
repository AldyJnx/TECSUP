import 'package:flutter/cupertino.dart';

import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';
import 'main_tabs.dart';
import 'registro_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usuario = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _usuario.dispose();
    _password.dispose();
    super.dispose();
  }

  void _entrar() {
    if (_usuario.text.trim().isEmpty || _password.text.isEmpty) {
      _alerta('Falta un dato', 'Escribe tu usuario y contrasena para entrar a la boveda.');
      return;
    }
    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(builder: (_) => const MainTabs()),
    );
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

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: Fk.bg0,
      child: AuroraBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 40, 24, 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _Logo(),
                const SizedBox(height: 40),
                GlassPanel(
                  padding: const EdgeInsets.all(22),
                  glowColor: Fk.violet,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      GlassTextField(
                        label: 'Usuario',
                        placeholder: 'coleccionista_01',
                        icon: CupertinoIcons.person_fill,
                        controller: _usuario,
                      ),
                      const SizedBox(height: 18),
                      GlassTextField(
                        label: 'Contrasena',
                        placeholder: '********',
                        icon: CupertinoIcons.lock_fill,
                        controller: _password,
                        obscure: true,
                      ),
                      const SizedBox(height: 26),
                      GlowButton(
                        label: 'ENTRAR A LA BOVEDA',
                        icon: CupertinoIcons.arrow_right_circle_fill,
                        onPressed: _entrar,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                CupertinoButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      CupertinoPageRoute(builder: (_) => const RegistroScreen()),
                    );
                  },
                  child: const Text.rich(
                    TextSpan(
                      text: 'No tienes cuenta?  ',
                      style: TextStyle(color: Fk.textMuted, fontSize: 15),
                      children: [
                        TextSpan(
                          text: 'Crea la tuya',
                          style: TextStyle(
                            color: Fk.cyan,
                            fontWeight: FontWeight.w800,
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
      ),
    );
  }
}

/// Logo de la marca: monograma neon en vidrio + wordmark con gradiente.
class _Logo extends StatelessWidget {
  const _Logo();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 96,
          height: 96,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            gradient: Fk.brand,
            boxShadow: Fk.glow(Fk.violet, blur: 34, opacity: 0.7),
          ),
          child: const Icon(CupertinoIcons.cube_box_fill, color: Fk.text, size: 50),
        ),
        const SizedBox(height: 26),
        ShaderMask(
          shaderCallback: (rect) => Fk.brand.createShader(rect),
          child: const Text(
            'POP VAULT',
            style: TextStyle(
              color: Fk.text,
              fontSize: 34,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Tu boveda de figuras Funko Pop',
          style: TextStyle(color: Fk.textMuted, fontSize: 15),
        ),
      ],
    );
  }
}
