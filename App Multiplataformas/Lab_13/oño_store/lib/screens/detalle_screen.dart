import 'package:flutter/cupertino.dart';

import '../models/producto.dart';
import '../state/carrito.dart';
import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';

class DetalleScreen extends StatelessWidget {
  const DetalleScreen({super.key, required this.producto});

  final Producto producto;

  void _anadir(BuildContext context) {
    Carrito.instance.agregar(producto);
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Anadido a la coleccion'),
        content: Text('"${producto.nombre}" ya esta en tu carrito.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Seguir viendo'),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('Listo'),
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
          child: Column(
            children: [
              // Cabecera transparente con retroceso.
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Pressable(
                      onPressed: () => Navigator.pop(context),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(11),
                        radius: 16,
                        child: const Icon(CupertinoIcons.back, color: Fk.text, size: 22),
                      ),
                    ),
                    CategoriaChip(categoria: producto.categoria),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Escenario de la figura con halo neon.
                      Container(
                        height: 320,
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(Fk.radius),
                          gradient: RadialGradient(
                            radius: 0.85,
                            colors: [
                              producto.color.withValues(alpha: 0.4),
                              producto.color.withValues(alpha: 0.02),
                            ],
                          ),
                          border: Border.all(color: Fk.glassBorder, width: 1),
                        ),
                        child: Hero(
                          tag: producto.id,
                          child: Image.asset(producto.imagen, fit: BoxFit.contain),
                        ),
                      ),
                      const SizedBox(height: 22),
                      RarezaChip(rareza: producto.rareza, fontSize: 12),
                      const SizedBox(height: 14),
                      Text(
                        producto.nombre,
                        style: const TextStyle(
                          color: Fk.text,
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                          height: 1.05,
                        ),
                      ),
                      const SizedBox(height: 16),
                      GlassPanel(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        radius: Fk.radiusSm,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            PrecioTag(precio: producto.precio, fontSize: 28),
                            const SizedBox(width: 8),
                            const Text(
                              'USD',
                              style: TextStyle(color: Fk.textMuted, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'DESCRIPCION',
                        style: TextStyle(
                          color: Fk.textMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.6,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        producto.descripcion,
                        style: const TextStyle(
                          color: Fk.textMuted,
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Barra inferior fija de vidrio.
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 6, 20, 14),
                child: GlowButton(
                  label: 'ANADIR A LA COLECCION',
                  icon: CupertinoIcons.bag_badge_plus,
                  onPressed: () => _anadir(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
