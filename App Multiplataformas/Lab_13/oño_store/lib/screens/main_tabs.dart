import 'package:flutter/cupertino.dart';

import '../state/carrito.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'inventario_screen.dart';
import 'perfil_screen.dart';

/// Navegacion principal con barra inferior de vidrio (blur translucido).
class MainTabs extends StatelessWidget {
  const MainTabs({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      backgroundColor: Fk.bg0,
      tabBar: CupertinoTabBar(
        // backgroundColor translucido => CupertinoTabBar aplica blur automatico.
        backgroundColor: const Color(0xB30B0B0F),
        activeColor: Fk.cyan,
        inactiveColor: Fk.textFaint,
        border: const Border(top: BorderSide(color: Fk.glassBorder, width: 1)),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.square_grid_2x2_fill),
            label: 'Catalogo',
          ),
          BottomNavigationBarItem(
            icon: _IconoCarrito(),
            label: 'Carrito',
          ),
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.person_fill),
            label: 'Perfil',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0:
            return CupertinoTabView(builder: (_) => const HomeScreen());
          case 1:
            return CupertinoTabView(builder: (_) => const InventarioScreen());
          default:
            return CupertinoTabView(builder: (_) => const PerfilScreen());
        }
      },
    );
  }
}

/// Icono del carrito con un contador neon cuando hay figuras.
class _IconoCarrito extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<dynamic>>(
      valueListenable: Carrito.instance.items,
      builder: (context, items, _) {
        return Stack(
          clipBehavior: Clip.none,
          children: [
            const Icon(CupertinoIcons.bag_fill),
            if (items.isNotEmpty)
              Positioned(
                right: -8,
                top: -6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    gradient: Fk.brandWarm,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: Fk.glow(Fk.pink, blur: 10, opacity: 0.7),
                  ),
                  child: Text(
                    '${items.length}',
                    style: const TextStyle(
                      color: Fk.text,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
