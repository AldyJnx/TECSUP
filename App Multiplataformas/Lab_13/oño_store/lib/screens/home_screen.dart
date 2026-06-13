import 'package:flutter/cupertino.dart';

import '../data/productos.dart';
import '../models/producto.dart';
import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';
import 'detalle_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: Fk.bg0,
      child: AuroraBackground(
        child: SafeArea(
          bottom: false,
          child: CustomScrollView(
            slivers: [
              const SliverToBoxAdapter(child: _Header()),
              SliverToBoxAdapter(child: const _Banner()),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 32),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.62,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => _Tarjeta(producto: kProductos[i]),
                    childCount: kProductos.length,
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

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Catalogo',
                style: TextStyle(color: Fk.textMuted, fontSize: 14),
              ),
              const SizedBox(height: 2),
              ShaderMask(
                shaderCallback: (rect) => Fk.brand.createShader(rect),
                child: const Text(
                  'POP VAULT',
                  style: TextStyle(
                    color: Fk.text,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
          GlassPanel(
            padding: const EdgeInsets.all(12),
            radius: 18,
            child: const Icon(CupertinoIcons.search, color: Fk.text, size: 22),
          ),
        ],
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(Fk.radius),
          gradient: Fk.brandWarm,
          boxShadow: Fk.glow(Fk.pink, blur: 30, opacity: 0.45),
        ),
        child: Row(
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Drop legendario',
                    style: TextStyle(
                      color: Fk.text,
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Envio gratis en figuras exclusivas',
                    style: TextStyle(color: Color(0xE6FFFFFF), fontSize: 14),
                  ),
                ],
              ),
            ),
            Container(
              width: 52,
              height: 52,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Fk.glassFillStrong,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Fk.glassBorderBright, width: 1),
              ),
              child: const Icon(CupertinoIcons.sparkles, color: Fk.text, size: 28),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tarjeta extends StatelessWidget {
  const _Tarjeta({required this.producto});

  final Producto producto;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: () {
        Navigator.of(context).push(
          CupertinoPageRoute(builder: (_) => DetalleScreen(producto: producto)),
        );
      },
      child: GlassPanel(
        padding: const EdgeInsets.all(12),
        glowColor: producto.color,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Escenario de la figura: halo de color tras la imagen.
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(Fk.radiusSm),
                        gradient: RadialGradient(
                          radius: 0.9,
                          colors: [
                            producto.color.withValues(alpha: 0.35),
                            producto.color.withValues(alpha: 0.04),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Hero(
                      tag: producto.id,
                      child: Image.asset(producto.imagen, fit: BoxFit.contain),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    left: 4,
                    child: RarezaChip(rareza: producto.rareza, fontSize: 9),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              producto.nombre,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Fk.text,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              producto.categoria,
              style: const TextStyle(color: Fk.textFaint, fontSize: 12),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                PrecioTag(precio: producto.precio, fontSize: 17),
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: Fk.brand,
                    boxShadow: Fk.glow(Fk.violet, blur: 14, opacity: 0.5),
                  ),
                  child: const Icon(CupertinoIcons.add, color: Fk.text, size: 18),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
