import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/products_provider.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final products = context.watch<ProductsProvider>();
    final cs = Theme.of(context).colorScheme;
    final email = auth.user?.email ?? '';
    final firstName = email.split('@').first;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _WelcomeBanner(firstName: firstName, cs: cs),
          const SizedBox(height: 20),
          _StatsRow(products: products, cs: cs),
          const SizedBox(height: 24),
          Text(
            'Accesos rápidos',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.add_box_rounded,
                  label: 'Registrar\nProducto',
                  color: cs.primaryContainer,
                  onTap: () => context.go('/home/products/new'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ActionCard(
                  icon: Icons.list_alt_rounded,
                  label: 'Lista de\nProductos',
                  color: cs.secondaryContainer,
                  onTap: () => context.go('/home/products'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.person_rounded,
                  label: 'Mi\nPerfil',
                  color: cs.tertiaryContainer,
                  onTap: () => context.go('/home/profile'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: _StockAlertCard(products: products, cs: cs)),
            ],
          ),
          const SizedBox(height: 24),
          _RecentSection(products: products, cs: cs),
        ],
      ),
    );
  }
}

class _WelcomeBanner extends StatelessWidget {
  final String firstName;
  final ColorScheme cs;

  const _WelcomeBanner({required this.firstName, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [cs.primary, cs.primaryContainer],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '¡Hola, $firstName!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Bienvenido a tu gestor de inventario',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.inventory_2_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final ProductsProvider products;
  final ColorScheme cs;

  const _StatsRow({required this.products, required this.cs});

  @override
  Widget build(BuildContext context) {
    final total = products.products.length;
    final totalStock =
        products.products.fold<int>(0, (s, p) => s + p.stock);
    final cats = products.products.map((p) => p.category).toSet().length;

    return Row(
      children: [
        Expanded(
            child: _StatChip(
                value: '$total', label: 'Productos', icon: Icons.inventory_2_outlined, cs: cs)),
        const SizedBox(width: 10),
        Expanded(
            child: _StatChip(
                value: '$totalStock', label: 'Unidades', icon: Icons.layers_outlined, cs: cs)),
        const SizedBox(width: 10),
        Expanded(
            child: _StatChip(
                value: '$cats', label: 'Categorías', icon: Icons.category_outlined, cs: cs)),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final ColorScheme cs;

  const _StatChip(
      {required this.value,
      required this.label,
      required this.icon,
      required this.cs});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        child: Column(
          children: [
            Icon(icon, color: cs.primary, size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: cs.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                  fontSize: 10, color: cs.onSurface.withValues(alpha: 0.55)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      color: color,
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Row(
            children: [
              Icon(icon, size: 26, color: cs.onSurface.withValues(alpha: 0.75)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: cs.onSurface,
                    fontSize: 13,
                    height: 1.35,
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

class _StockAlertCard extends StatelessWidget {
  final ProductsProvider products;
  final ColorScheme cs;

  const _StockAlertCard({required this.products, required this.cs});

  @override
  Widget build(BuildContext context) {
    final lowStock = products.products.where((p) => p.stock < 10).length;
    final hasAlert = lowStock > 0;
    return Card(
      color: hasAlert ? Colors.orange.shade50 : Colors.green.shade50,
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Row(
          children: [
            Icon(
              hasAlert
                  ? Icons.warning_amber_rounded
                  : Icons.check_circle_outline_rounded,
              size: 26,
              color: hasAlert ? Colors.orange.shade700 : Colors.green.shade700,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                hasAlert ? 'Stock\nbajo: $lowStock' : 'Stock\nóptimo',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: cs.onSurface,
                  fontSize: 13,
                  height: 1.35,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentSection extends StatelessWidget {
  final ProductsProvider products;
  final ColorScheme cs;

  const _RecentSection({required this.products, required this.cs});

  @override
  Widget build(BuildContext context) {
    if (products.products.isEmpty) return const SizedBox.shrink();
    final recent = products.products.reversed.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Últimos productos',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () => context.go('/home/products'),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...recent.map(
          (p) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
              tileColor: cs.surfaceContainer,
              leading: CircleAvatar(
                backgroundColor: cs.primaryContainer,
                child: Icon(Icons.inventory_outlined,
                    size: 18, color: cs.onPrimaryContainer),
              ),
              title: Text(p.name,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14)),
              subtitle: Text(p.category,
                  style: TextStyle(
                      fontSize: 12, color: cs.onSurface.withValues(alpha: 0.55))),
              trailing: Text(
                'S/ ${p.price.toStringAsFixed(2)}',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: cs.primary,
                    fontSize: 13),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
