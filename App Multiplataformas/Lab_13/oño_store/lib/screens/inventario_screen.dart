import 'package:flutter/cupertino.dart';

import '../models/producto.dart';
import '../state/carrito.dart';
import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';

class InventarioScreen extends StatelessWidget {
  const InventarioScreen({super.key});

  void _confirmarCompra(BuildContext context, double total) {
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Pedido confirmado'),
        content: Text(
          'Has gastado \$${total.toStringAsFixed(0)}. '
          'Tus figuras llegaran pronto, bien protegidas.',
        ),
        actions: [
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () {
              Carrito.instance.vaciar();
              Navigator.pop(ctx);
            },
            child: const Text('Genial'),
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
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 6),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Mi carrito',
                    style: TextStyle(
                      color: Fk.text,
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: ValueListenableBuilder<List<Producto>>(
                  valueListenable: Carrito.instance.items,
                  builder: (context, items, _) {
                    if (items.isEmpty) return const _CarritoVacio();
                    return Column(
                      children: [
                        Expanded(
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                            itemCount: items.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 12),
                            itemBuilder: (context, i) => _Fila(producto: items[i]),
                          ),
                        ),
                        _BarraTotal(
                          total: Carrito.instance.total,
                          onComprar: () =>
                              _confirmarCompra(context, Carrito.instance.total),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Fila extends StatelessWidget {
  const _Fila({required this.producto});

  final Producto producto;

  @override
  Widget build(BuildContext context) {
    return GlassPanel(
      padding: const EdgeInsets.all(10),
      child: Row(
        children: [
          // Miniatura con halo de color.
          Container(
            width: 70,
            height: 70,
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: RadialGradient(
                radius: 0.9,
                colors: [
                  producto.color.withValues(alpha: 0.4),
                  producto.color.withValues(alpha: 0.05),
                ],
              ),
            ),
            child: Image.asset(producto.imagen, fit: BoxFit.contain),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  producto.nombre,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Fk.text,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  producto.categoria,
                  style: const TextStyle(color: Fk.textFaint, fontSize: 13),
                ),
                const SizedBox(height: 8),
                PrecioTag(precio: producto.precio, fontSize: 16),
              ],
            ),
          ),
          Pressable(
            onPressed: () => Carrito.instance.quitar(producto),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Fk.pink.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Fk.pink.withValues(alpha: 0.5), width: 1),
              ),
              child: const Icon(CupertinoIcons.trash_fill, color: Fk.pink, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

class _BarraTotal extends StatelessWidget {
  const _BarraTotal({required this.total, required this.onComprar});

  final double total;
  final VoidCallback onComprar;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 14),
      child: GlassPanel(
        padding: const EdgeInsets.all(18),
        glowColor: Fk.mint,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(
                    color: Fk.textMuted,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                PrecioTag(precio: total, fontSize: 26),
              ],
            ),
            const SizedBox(height: 16),
            GlowButton(
              label: 'FINALIZAR COMPRA',
              icon: CupertinoIcons.bag_fill,
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Fk.mint, Fk.cyan],
              ),
              glowColor: Fk.mint,
              onPressed: onComprar,
            ),
          ],
        ),
      ),
    );
  }
}

class _CarritoVacio extends StatelessWidget {
  const _CarritoVacio();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 104,
              height: 104,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(32),
                color: Fk.glassFill,
                border: Border.all(color: Fk.glassBorder, width: 1),
                boxShadow: Fk.glow(Fk.violet, blur: 30, opacity: 0.3),
              ),
              child: const Icon(CupertinoIcons.bag, color: Fk.textMuted, size: 52),
            ),
            const SizedBox(height: 24),
            const Text(
              'Tu carrito esta vacio',
              style: TextStyle(
                color: Fk.text,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Explora el catalogo y suma tus figuras favoritas',
              textAlign: TextAlign.center,
              style: TextStyle(color: Fk.textMuted, fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
