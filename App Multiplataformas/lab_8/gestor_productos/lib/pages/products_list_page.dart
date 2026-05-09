import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/products_provider.dart';

class ProductsListPage extends StatefulWidget {
  const ProductsListPage({super.key});

  @override
  State<ProductsListPage> createState() => _ProductsListPageState();
}

class _ProductsListPageState extends State<ProductsListPage> {
  String _filter = 'Todos';

  static const _categories = [
    'Todos',
    'Electrónica',
    'Ropa',
    'Alimentos',
    'Hogar',
    'Otros',
  ];

  static const _catColors = {
    'Electrónica': Color(0xFF3B82F6),
    'Ropa': Color(0xFFEC4899),
    'Alimentos': Color(0xFF22C55E),
    'Hogar': Color(0xFFF59E0B),
    'Otros': Color(0xFF8B5CF6),
  };

  static const _catIcons = {
    'Electrónica': Icons.devices_rounded,
    'Ropa': Icons.checkroom_rounded,
    'Alimentos': Icons.restaurant_rounded,
    'Hogar': Icons.home_rounded,
    'Otros': Icons.category_rounded,
  };

  static final _currency = NumberFormat.currency(
    locale: 'es_PE',
    symbol: 'S/ ',
    decimalDigits: 2,
  );

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProductsProvider>();
    final all = provider.products;
    final filtered = _filter == 'Todos'
        ? all
        : all.where((p) => p.category == _filter).toList();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: provider.load,
        child: Column(
          children: [
            _FilterBar(
              categories: _categories,
              selected: _filter,
              onSelect: (c) => setState(() => _filter = c),
            ),
            Expanded(
              child: all.isEmpty
                  ? _EmptyState(onRegister: () => context.go('/home/products/new'))
                  : filtered.isEmpty
                      ? _NoMatch(filter: _filter)
                      : _ProductList(
                          products: filtered,
                          catColors: _catColors,
                          catIcons: _catIcons,
                          currency: _currency,
                          provider: provider,
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/home/products/new'),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  final List<String> categories;
  final String selected;
  final ValueChanged<String> onSelect;

  const _FilterBar({
    required this.categories,
    required this.selected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (ctx, i) {
          final cat = categories[i];
          return FilterChip(
            label: Text(cat),
            selected: cat == selected,
            onSelected: (_) => onSelect(cat),
            selectedColor: Theme.of(ctx).colorScheme.primaryContainer,
          );
        },
      ),
    );
  }
}

class _ProductList extends StatelessWidget {
  final List<Product> products;
  final Map<String, Color> catColors;
  final Map<String, IconData> catIcons;
  final NumberFormat currency;
  final ProductsProvider provider;

  const _ProductList({
    required this.products,
    required this.catColors,
    required this.catIcons,
    required this.currency,
    required this.provider,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
      itemCount: products.length,
      separatorBuilder: (context, index) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) =>
          _ProductCard(
            product: products[i],
            catColors: catColors,
            catIcons: catIcons,
            currency: currency,
            provider: provider,
          ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final Map<String, Color> catColors;
  final Map<String, IconData> catIcons;
  final NumberFormat currency;
  final ProductsProvider provider;

  const _ProductCard({
    required this.product,
    required this.catColors,
    required this.catIcons,
    required this.currency,
    required this.provider,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = catColors[product.category] ?? cs.primary;
    final icon =
        catIcons[product.category] ?? Icons.category_rounded;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14.5,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.delete_outline_rounded,
                            color: cs.error, size: 20),
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => _confirmDelete(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      _Badge(label: product.category, color: color),
                      const Spacer(),
                      _StockBadge(stock: product.stock),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    currency.format(product.price),
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: cs.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar producto'),
        content: Text(
            '¿Eliminar "${product.name}"? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(
                backgroundColor: Theme.of(ctx).colorScheme.error),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await provider.remove(product.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('"${product.name}" eliminado'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;

  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
            fontSize: 11, color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _StockBadge extends StatelessWidget {
  final int stock;

  const _StockBadge({required this.stock});

  @override
  Widget build(BuildContext context) {
    final color = stock == 0
        ? Colors.red
        : stock < 10
            ? Colors.orange
            : Colors.green;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.inventory_outlined, size: 11, color: color),
          const SizedBox(width: 4),
          Text(
            'Stock: $stock',
            style: TextStyle(
                fontSize: 11, color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onRegister;

  const _EmptyState({required this.onRegister});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined,
                size: 80, color: cs.onSurface.withValues(alpha: 0.2)),
            const SizedBox(height: 20),
            Text(
              'No hay productos registrados',
              style: TextStyle(
                  fontSize: 16,
                  color: cs.onSurface.withValues(alpha: 0.5)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Agrega tu primer producto para comenzar',
              style: TextStyle(
                  fontSize: 13,
                  color: cs.onSurface.withValues(alpha: 0.35)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            FilledButton.icon(
              onPressed: onRegister,
              icon: const Icon(Icons.add),
              label: const Text('Registrar producto'),
            ),
          ],
        ),
      ),
    );
  }
}

class _NoMatch extends StatelessWidget {
  final String filter;

  const _NoMatch({required this.filter});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded,
              size: 60, color: cs.onSurface.withValues(alpha: 0.2)),
          const SizedBox(height: 16),
          Text(
            'Sin productos en "$filter"',
            style:
                TextStyle(color: cs.onSurface.withValues(alpha: 0.5)),
          ),
        ],
      ),
    );
  }
}
