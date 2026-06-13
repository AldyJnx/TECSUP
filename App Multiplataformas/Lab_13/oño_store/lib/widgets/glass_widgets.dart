import 'dart:ui' as ui;

import 'package:flutter/cupertino.dart';

import '../theme/app_theme.dart';

/// Panel de vidrio esmerilado (glassmorphism).
///
/// Desenfoca lo que tiene detras (backdrop blur), pinta un relleno translucido
/// con un sutil gradiente y dibuja un borde semi-transparente que simula la
/// refraccion de la luz en el canto del vidrio. Esquinas amplias (squircle).
class GlassPanel extends StatelessWidget {
  const GlassPanel({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.radius = Fk.radius,
    this.blur = 18,
    this.glowColor,
    this.borderColor = Fk.glassBorder,
    this.fill = Fk.glassFill,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final double blur;

  /// Si se indica, agrega un halo neon perimetral.
  final Color? glowColor;
  final Color borderColor;
  final Color fill;

  @override
  Widget build(BuildContext context) {
    final br = BorderRadius.circular(radius);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: br,
        boxShadow: glowColor != null ? Fk.glow(glowColor!, opacity: 0.35) : null,
      ),
      child: ClipRRect(
        borderRadius: br,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: br,
              border: Border.all(color: borderColor, width: 1.2),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [fill, fill.withValues(alpha: 0.02)],
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Envuelve cualquier hijo con una microinteraccion organica: al presionar se
/// encoge un poco (escala) usando una curva de resorte y aumenta su brillo.
class Pressable extends StatefulWidget {
  const Pressable({
    super.key,
    required this.child,
    required this.onPressed,
    this.pressedScale = 0.95,
  });

  final Widget child;
  final VoidCallback onPressed;
  final double pressedScale;

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _down = true),
      onTapCancel: () => setState(() => _down = false),
      onTapUp: (_) {
        setState(() => _down = false);
        widget.onPressed();
      },
      child: AnimatedScale(
        scale: _down ? widget.pressedScale : 1.0,
        // Curva de resorte: rebote sutil al soltar (no lineal, no mecanico).
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOutBack,
        child: widget.child,
      ),
    );
  }
}

/// Boton neon principal: squircle relleno con gradiente de marca, halo glow y
/// microinteraccion de resorte heredada de [Pressable].
class GlowButton extends StatelessWidget {
  const GlowButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.gradient,
    this.glowColor = Fk.violet,
    this.expand = true,
    this.fontSize = 16,
  });

  final String label;
  final VoidCallback onPressed;
  final IconData? icon;
  final Gradient? gradient;
  final Color glowColor;
  final bool expand;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onPressed,
      child: Container(
        width: expand ? double.infinity : null,
        padding: const EdgeInsets.symmetric(vertical: 17, horizontal: 24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(Fk.radius),
          gradient: gradient ?? Fk.brand,
          boxShadow: Fk.glow(glowColor, blur: 30, opacity: 0.6),
        ),
        child: Row(
          mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, color: Fk.text, size: fontSize + 4),
              const SizedBox(width: 10),
            ],
            Flexible(
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Fk.text,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Campo de texto sobre vidrio, con etiqueta e icono neon.
class GlassTextField extends StatelessWidget {
  const GlassTextField({
    super.key,
    required this.label,
    required this.placeholder,
    required this.icon,
    this.controller,
    this.obscure = false,
    this.keyboardType,
  });

  final String label;
  final String placeholder;
  final IconData icon;
  final TextEditingController? controller;
  final bool obscure;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 6, bottom: 8),
          child: Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Fk.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.6,
            ),
          ),
        ),
        GlassPanel(
          padding: EdgeInsets.zero,
          radius: Fk.radiusSm,
          blur: 14,
          child: CupertinoTextField(
            controller: controller,
            placeholder: placeholder,
            obscureText: obscure,
            keyboardType: keyboardType,
            padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 14),
            prefix: Padding(
              padding: const EdgeInsets.only(left: 14),
              child: Icon(icon, color: Fk.cyan, size: 19),
            ),
            style: const TextStyle(color: Fk.text, fontSize: 17),
            placeholderStyle: const TextStyle(color: Fk.textFaint, fontSize: 17),
            cursorColor: Fk.cyan,
            decoration: const BoxDecoration(),
          ),
        ),
      ],
    );
  }
}

/// Etiqueta de rareza: pildora de vidrio con borde y glow del color del nivel.
class RarezaChip extends StatelessWidget {
  const RarezaChip({super.key, required this.rareza, this.fontSize = 11});

  final String rareza;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final color = Fk.colorRareza(rareza);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: color.withValues(alpha: 0.7), width: 1),
        boxShadow: Fk.glow(color, blur: 14, opacity: 0.35),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 7),
          Text(
            rareza.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}

/// Precio en dolares con un punto neon menta a modo de "moneda".
class PrecioTag extends StatelessWidget {
  const PrecioTag({
    super.key,
    required this.precio,
    this.fontSize = 18,
    this.color = Fk.mint,
  });

  final double precio;
  final double fontSize;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '\$',
          style: TextStyle(
            color: color,
            fontSize: fontSize * 0.7,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(width: 2),
        Text(
          precio.toStringAsFixed(0),
          style: TextStyle(
            color: color,
            fontSize: fontSize,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }
}

/// Pildora de categoria, plana y discreta sobre vidrio.
class CategoriaChip extends StatelessWidget {
  const CategoriaChip({super.key, required this.categoria, this.fontSize = 12});

  final String categoria;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
      decoration: BoxDecoration(
        color: Fk.glassFillStrong,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: Fk.glassBorder, width: 1),
      ),
      child: Text(
        categoria.toUpperCase(),
        style: TextStyle(
          color: Fk.textMuted,
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
