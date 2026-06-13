import 'package:flutter/cupertino.dart';

import '../state/carrito.dart';
import '../theme/app_theme.dart';
import '../widgets/aurora_background.dart';
import '../widgets/glass_widgets.dart';
import 'login_screen.dart';

class PerfilScreen extends StatelessWidget {
  const PerfilScreen({super.key});

  void _logout(BuildContext context) {
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Cerrar sesion'),
        content: const Text('Seguro que quieres salir de tu boveda?'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () {
              Carrito.instance.vaciar();
              Navigator.pop(ctx);
              Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
                CupertinoPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            child: const Text('Salir'),
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
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Mi perfil',
                    style: TextStyle(
                      color: Fk.text,
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                // Tarjeta de cabecera del coleccionista.
                GlassPanel(
                  padding: const EdgeInsets.all(20),
                  glowColor: Fk.violet,
                  child: Row(
                    children: [
                      Container(
                        width: 68,
                        height: 68,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(22),
                          gradient: Fk.brand,
                          boxShadow: Fk.glow(Fk.violet, blur: 22, opacity: 0.6),
                        ),
                        child: const Text(
                          'C',
                          style: TextStyle(
                            color: Fk.text,
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'coleccionista_01',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: Fk.text,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Miembro Gold - Cazador de exclusivos',
                              style: TextStyle(color: Fk.textMuted, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const _BarraColeccion(meta: 50, actual: 36),
                const SizedBox(height: 22),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'ESTADISTICAS',
                    style: TextStyle(
                      color: Fk.textMuted,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.6,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 14,
                  childAspectRatio: 1.45,
                  children: [
                    const _Stat(
                      icono: CupertinoIcons.cube_box_fill,
                      valor: '36',
                      titulo: 'Figuras',
                      color: Fk.cyan,
                    ),
                    const _Stat(
                      icono: CupertinoIcons.star_fill,
                      valor: '7',
                      titulo: 'Exclusivos',
                      color: Fk.amber,
                    ),
                    const _Stat(
                      icono: CupertinoIcons.flame_fill,
                      valor: '128',
                      titulo: 'Dias de racha',
                      color: Fk.pink,
                    ),
                    ValueListenableBuilder(
                      valueListenable: Carrito.instance.items,
                      builder: (context, items, _) => _Stat(
                        icono: CupertinoIcons.bag_fill,
                        valor: '${items.length}',
                        titulo: 'En el carrito',
                        color: Fk.violet,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 26),
                GlowButton(
                  label: 'CERRAR SESION',
                  icon: CupertinoIcons.square_arrow_right,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Fk.pink, Fk.violetDeep],
                  ),
                  glowColor: Fk.pink,
                  onPressed: () => _logout(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BarraColeccion extends StatelessWidget {
  const _BarraColeccion({required this.meta, required this.actual});

  final int meta;
  final int actual;

  @override
  Widget build(BuildContext context) {
    final progreso = (actual / meta).clamp(0.0, 1.0);
    return GlassPanel(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Coleccion 2026',
                style: TextStyle(
                  color: Fk.text,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                '$actual / $meta',
                style: const TextStyle(
                  color: Fk.cyan,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Container(
              height: 12,
              color: Fk.glassFillStrong,
              child: Align(
                alignment: Alignment.centerLeft,
                child: FractionallySizedBox(
                  widthFactor: progreso,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: Fk.brand,
                      boxShadow: Fk.glow(Fk.cyan, blur: 12, opacity: 0.6),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Te faltan 14 figuras para completar la serie',
            style: TextStyle(color: Fk.textMuted, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({
    required this.icono,
    required this.valor,
    required this.titulo,
    required this.color,
  });

  final IconData icono;
  final String valor;
  final String titulo;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return GlassPanel(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.45), width: 1),
            ),
            child: Icon(icono, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                valor,
                style: const TextStyle(
                  color: Fk.text,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                titulo,
                style: const TextStyle(color: Fk.textMuted, fontSize: 13),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
