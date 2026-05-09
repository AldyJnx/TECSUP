import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/products_provider.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  static final _dateFmt = DateFormat('dd/MM/yyyy HH:mm');

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final products = context.watch<ProductsProvider>();
    final cs = Theme.of(context).colorScheme;
    final email = auth.user?.email ?? '';
    final initial = email.isNotEmpty ? email[0].toUpperCase() : '?';
    final loginAt = auth.user?.loginAt;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 12),
          _AvatarSection(initial: initial, email: email, cs: cs),
          const SizedBox(height: 24),
          _InfoCard(
            email: email,
            loginAt: loginAt,
            dateFmt: _dateFmt,
            cs: cs,
          ),
          const SizedBox(height: 16),
          _ActivityCard(products: products, cs: cs),
          const SizedBox(height: 32),
          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: cs.error,
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _confirmLogout(context, auth),
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Cerrar Sesión'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, AuthProvider auth) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que deseas salir?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(
                backgroundColor: Theme.of(ctx).colorScheme.error),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Salir'),
          ),
        ],
      ),
    );
    if (confirmed == true) await auth.logout();
  }
}

class _AvatarSection extends StatelessWidget {
  final String initial;
  final String email;
  final ColorScheme cs;

  const _AvatarSection(
      {required this.initial, required this.email, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: cs.primary.withValues(alpha: 0.25),
                    blurRadius: 20,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: CircleAvatar(
                radius: 52,
                backgroundColor: cs.primaryContainer,
                child: Text(
                  initial,
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: cs.onPrimaryContainer,
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: cs.primary,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: const Icon(Icons.edit_rounded,
                  size: 14, color: Colors.white),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          email.split('@').first,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          email,
          style: TextStyle(
              fontSize: 13, color: cs.onSurface.withValues(alpha: 0.55)),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: cs.primaryContainer,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            'Administrador',
            style: TextStyle(
                fontSize: 12,
                color: cs.onPrimaryContainer,
                fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String email;
  final DateTime? loginAt;
  final DateFormat dateFmt;
  final ColorScheme cs;

  const _InfoCard({
    required this.email,
    required this.loginAt,
    required this.dateFmt,
    required this.cs,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información de cuenta',
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: cs.primary, fontSize: 14),
            ),
            const Divider(height: 20),
            _Row(
                icon: Icons.email_outlined, label: 'Correo', value: email),
            const SizedBox(height: 12),
            _Row(
              icon: Icons.access_time_rounded,
              label: 'Sesión iniciada',
              value: loginAt != null ? dateFmt.format(loginAt!) : '—',
            ),
            const SizedBox(height: 12),
            _Row(
                icon: Icons.shield_outlined,
                label: 'Rol',
                value: 'Administrador'),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _Row(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(icon, size: 18, color: cs.primary),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                  fontSize: 11,
                  color: cs.onSurface.withValues(alpha: 0.5)),
            ),
            Text(
              value,
              style:
                  const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ],
    );
  }
}

class _ActivityCard extends StatelessWidget {
  final ProductsProvider products;
  final ColorScheme cs;

  const _ActivityCard({required this.products, required this.cs});

  @override
  Widget build(BuildContext context) {
    final total = products.products.length;
    final totalStock =
        products.products.fold<int>(0, (s, p) => s + p.stock);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mi actividad',
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: cs.primary, fontSize: 14),
            ),
            const Divider(height: 20),
            Row(
              children: [
                Expanded(
                  child: _ActivityItem(
                    icon: Icons.inventory_2_outlined,
                    value: '$total',
                    label: 'Productos\nregistrados',
                    bg: cs.primaryContainer,
                    cs: cs,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ActivityItem(
                    icon: Icons.layers_outlined,
                    value: '$totalStock',
                    label: 'Unidades\nen stock',
                    bg: cs.secondaryContainer,
                    cs: cs,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color bg;
  final ColorScheme cs;

  const _ActivityItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.bg,
    required this.cs,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: cs.onSurface.withValues(alpha: 0.65)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: cs.onSurface.withValues(alpha: 0.6),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}
