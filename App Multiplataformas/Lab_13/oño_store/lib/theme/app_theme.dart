import 'package:flutter/cupertino.dart';

/// Sistema de diseno de POP VAULT.
///
/// Estetica premium, oscura y futurista: glassmorphism (vidrio esmerilado),
/// fondos tipo aurora / mesh gradient, acentos neon con glow y formas
/// organicas de radio amplio (squircles). Todo el lenguaje visual vive aqui.
class Fk {
  Fk._();

  // ------------------------------------------------------------------
  // Lienzo oscuro
  // ------------------------------------------------------------------
  static const Color bg0 = Color(0xFF0B0B0F); // negro profundo (base)
  static const Color bg1 = Color(0xFF121216); // gris muy oscuro (paneles)

  // ------------------------------------------------------------------
  // Acentos neon / aurora
  // ------------------------------------------------------------------
  static const Color violet = Color(0xFF7C5CFF); // violeta electrico
  static const Color violetDeep = Color(0xFF4D2BD6);
  static const Color cyan = Color(0xFF22D3EE); // cian glow
  static const Color pink = Color(0xFFFF4D9D); // magenta neon
  static const Color mint = Color(0xFF34E1B6); // verde menta (precio / ok)
  static const Color amber = Color(0xFFFFB020); // ambar (legendario)

  // ------------------------------------------------------------------
  // Texto
  // ------------------------------------------------------------------
  static const Color text = Color(0xFFF4F4F8); // blanco humo
  static const Color textMuted = Color(0xFF9A9AA8); // gris secundario
  static const Color textFaint = Color(0xFF63636F); // gris terciario

  // ------------------------------------------------------------------
  // Vidrio (capas translucidas superpuestas)
  // ------------------------------------------------------------------
  static const Color glassFill = Color(0x14FFFFFF); // relleno ~8%
  static const Color glassFillStrong = Color(0x1FFFFFFF); // relleno ~12%
  static const Color glassBorder = Color(0x2EFFFFFF); // borde ~18%
  static const Color glassBorderBright = Color(0x52FFFFFF); // borde ~32%

  /// Radio amplio para botones y tarjetas (squircle Apple-like).
  static const double radius = 26;
  static const double radiusSm = 16;

  // ------------------------------------------------------------------
  // Gradientes vivos (mesh / aurora)
  // ------------------------------------------------------------------
  /// Gradiente principal de marca (violeta -> cian -> rosa).
  static const LinearGradient brand = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [violet, cyan],
  );

  static const LinearGradient brandWarm = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [pink, violet],
  );

  /// Sombra de glow neon reutilizable (suave, sin borde duro).
  static List<BoxShadow> glow(Color color, {double blur = 26, double spread = -4, double opacity = 0.55}) {
    return [
      BoxShadow(
        color: color.withValues(alpha: opacity),
        blurRadius: blur,
        spreadRadius: spread,
      ),
    ];
  }

  /// Color de acento asociado a cada nivel de rareza del coleccionable.
  static Color colorRareza(String rareza) {
    switch (rareza.toLowerCase()) {
      case 'legendario':
        return amber;
      case 'epico':
      case 'épico':
        return violet;
      case 'raro':
        return cyan;
      default:
        return mint;
    }
  }
}
