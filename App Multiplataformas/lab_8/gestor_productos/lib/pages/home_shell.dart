import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';

class HomeShell extends StatelessWidget {
  final Widget child;
  final String location;

  const HomeShell({
    super.key,
    required this.child,
    required this.location,
  });

  String get _title {
    if (location.contains('/products/new')) return 'Registrar Producto';
    if (location.contains('/products')) return 'Productos';
    if (location.contains('/profile')) return 'Mi Perfil';
    return 'Inicio';
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _title,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 18),
        ),
        backgroundColor: cs.surface,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
      ),
      drawer: AppDrawer(currentLocation: location),
      body: child,
    );
  }
}
