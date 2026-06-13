import 'package:flutter/cupertino.dart';

import '../models/producto.dart';

/// "Inventario" del jugador: estado global del carrito de compras.
///
/// Se implementa como singleton con un [ValueNotifier] para reconstruir la
/// UI cuando cambia, sin añadir paquetes externos (provider, etc.).
class Carrito {
  Carrito._();
  static final Carrito instance = Carrito._();

  final ValueNotifier<List<Producto>> items =
      ValueNotifier<List<Producto>>(<Producto>[]);

  void agregar(Producto p) {
    items.value = [...items.value, p];
  }

  /// Quita la primera aparición del producto indicado.
  void quitar(Producto p) {
    final copia = [...items.value];
    final i = copia.indexWhere((e) => e.id == p.id);
    if (i != -1) {
      copia.removeAt(i);
      items.value = copia;
    }
  }

  void vaciar() => items.value = <Producto>[];

  int get cantidad => items.value.length;

  double get total =>
      items.value.fold<double>(0, (suma, p) => suma + p.precio);
}
