import 'package:flutter/cupertino.dart';

/// Modelo de una figura Funko Pop del catalogo.
class Producto {
  final String id;
  final String nombre;
  final String descripcion;

  /// Precio en dolares.
  final double precio;

  /// Ruta del asset de la imagen.
  final String imagen;

  /// Color de acento neon para el glow de la tarjeta.
  final Color color;

  /// Franquicia / linea: "Marvel", "Anime", "Gaming"...
  final String categoria;

  /// Rareza del coleccionable: Comun, Raro, Epico, Legendario.
  final String rareza;

  const Producto({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.precio,
    required this.imagen,
    required this.color,
    required this.categoria,
    required this.rareza,
  });
}
