import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/cupertino.dart';

import '../theme/app_theme.dart';

/// Fondo "vivo" tipo Aurora / Mesh Gradient.
///
/// Pinta varias manchas de color neon que se trasladan y rotan muy lento en
/// bucle, todas difuminadas con un blur amplio para simular luz volumetrica.
/// Encima coloca el contenido de la pantalla (que normalmente usa vidrio).
class AuroraBackground extends StatefulWidget {
  const AuroraBackground({super.key, required this.child});

  final Widget child;

  @override
  State<AuroraBackground> createState() => _AuroraBackgroundState();
}

class _AuroraBackgroundState extends State<AuroraBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    // Ciclo muy lento (24 s) para que el fondo respire sin distraer.
    _c = AnimationController(vsync: this, duration: const Duration(seconds: 24))
      ..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Fk.bg0,
      child: Stack(
        children: [
          // Capa de manchas animadas + blur amplio.
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _c,
              builder: (context, _) {
                final t = _c.value * 2 * math.pi;
                return ImageFiltered(
                  imageFilter: ui.ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Stack(
                    children: [
                      _blob(
                        align: Alignment(0.8 * math.cos(t), -0.7 + 0.25 * math.sin(t)),
                        color: Fk.violet,
                        size: 320,
                      ),
                      _blob(
                        align: Alignment(-0.85 + 0.2 * math.sin(t * 1.3), 0.2 * math.cos(t)),
                        color: Fk.cyan,
                        size: 300,
                      ),
                      _blob(
                        align: Alignment(0.6 * math.sin(t * 0.8), 0.85 + 0.15 * math.cos(t)),
                        color: Fk.pink,
                        size: 340,
                      ),
                      _blob(
                        align: Alignment(0.2 * math.cos(t * 1.6), 0.1 * math.sin(t)),
                        color: Fk.violetDeep,
                        size: 240,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          // Veladura para oscurecer bordes y dar profundidad.
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  radius: 1.1,
                  colors: [Color(0x00000000), Color(0x800B0B0F)],
                ),
              ),
            ),
          ),
          // Contenido real.
          Positioned.fill(child: widget.child),
        ],
      ),
    );
  }

  Widget _blob({required Alignment align, required Color color, required double size}) {
    return Align(
      alignment: align,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [color.withValues(alpha: 0.55), color.withValues(alpha: 0.0)],
          ),
        ),
      ),
    );
  }
}
