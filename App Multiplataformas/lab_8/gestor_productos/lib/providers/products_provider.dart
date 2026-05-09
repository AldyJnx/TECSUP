import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/product.dart';

class ProductsProvider extends ChangeNotifier {
  final List<Product> _products = [];
  static const _uuid = Uuid();

  List<Product> get products => List.unmodifiable(_products);

  ProductsProvider() {
    load();
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('products');
    if (raw != null) {
      final list = jsonDecode(raw) as List<dynamic>;
      _products
        ..clear()
        ..addAll(list.map((e) => Product.fromJson(e as Map<String, dynamic>)));
    } else {
      _seedMockData();
    }
    notifyListeners();
  }

  void _seedMockData() {
    final now = DateTime.now();
    _products.addAll([
      Product(
        id: _uuid.v4(),
        name: 'Laptop HP Pavilion 15',
        description: 'Laptop 15.6" con Intel Core i5 de 12va gen, 16GB RAM',
        category: 'Electrónica',
        price: 2499.90,
        stock: 15,
        createdAt: now.subtract(const Duration(days: 10)),
      ),
      Product(
        id: _uuid.v4(),
        name: 'Camiseta Polo Classic',
        description: 'Camiseta polo de algodón 100%, colores variados',
        category: 'Ropa',
        price: 89.90,
        stock: 120,
        createdAt: now.subtract(const Duration(days: 7)),
      ),
      Product(
        id: _uuid.v4(),
        name: 'Sony WH-1000XM5',
        description: 'Auriculares inalámbricos con cancelación activa de ruido',
        category: 'Electrónica',
        price: 1199.00,
        stock: 8,
        createdAt: now.subtract(const Duration(days: 5)),
      ),
      Product(
        id: _uuid.v4(),
        name: 'Quinua Orgánica 500g',
        description: 'Quinua orgánica certificada de Puno, libre de gluten',
        category: 'Alimentos',
        price: 18.50,
        stock: 200,
        createdAt: now.subtract(const Duration(days: 3)),
      ),
      Product(
        id: _uuid.v4(),
        name: 'Silla Ergonómica Pro',
        description: 'Silla de oficina con soporte lumbar y reposapiés ajustable',
        category: 'Hogar',
        price: 649.90,
        stock: 6,
        createdAt: now.subtract(const Duration(days: 1)),
      ),
    ]);
  }

  Future<void> add({
    required String name,
    required String description,
    required String category,
    required double price,
    required int stock,
  }) async {
    _products.add(Product(
      id: _uuid.v4(),
      name: name,
      description: description,
      category: category,
      price: price,
      stock: stock,
      createdAt: DateTime.now(),
    ));
    await _persist();
    notifyListeners();
  }

  Future<void> remove(String id) async {
    _products.removeWhere((p) => p.id == id);
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      'products',
      jsonEncode(_products.map((p) => p.toJson()).toList()),
    );
  }
}
