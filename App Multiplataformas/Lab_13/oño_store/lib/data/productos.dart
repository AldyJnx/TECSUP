import '../models/producto.dart';
import '../theme/app_theme.dart';

/// Catalogo de figuras Funko Pop, construido a partir de las imagenes reales
/// de `assets/funkos/`.
const List<Producto> kProductos = [
  Producto(
    id: 'strange',
    nombre: 'Doctor Strange',
    descripcion:
        'El Hechicero Supremo en su pose mas iconica, capa de levitacion '
        'desplegada y el Ojo de Agamotto brillando entre sus dedos. Pintado '
        'a mano con detalles en la armadura mistica. Una pieza imprescindible '
        'para cualquier altar Marvel.',
    precio: 38,
    imagen: 'assets/funkos/strange.jpg',
    color: Fk.violet,
    categoria: 'Marvel',
    rareza: 'Legendario',
  ),
  Producto(
    id: 'kratos',
    nombre: 'Kratos',
    descripcion:
        'El Fantasma de Esparta empuna las Hojas del Caos en esta figura de '
        'acabado mate. Cicatriz roja, barba esculpida y cinturon de guerra '
        'con un nivel de detalle brutal. El dios de la guerra ahora vive en '
        'tu estanteria.',
    precio: 42,
    imagen: 'assets/funkos/kratos.jpg',
    color: Fk.pink,
    categoria: 'Gaming',
    rareza: 'Legendario',
  ),
  Producto(
    id: 'goku',
    nombre: 'Goku Kamehameha',
    descripcion:
        'Capturado en pleno Kamehameha, con la energia azul concentrandose '
        'entre sus manos y la cola de Saiyajin enroscada. El gi naranja '
        'clasico no podia faltar. Energia infinita en formato coleccionable.',
    precio: 35,
    imagen: 'assets/funkos/goku.jpg',
    color: Fk.amber,
    categoria: 'Anime',
    rareza: 'Epico',
  ),
  Producto(
    id: 'daenerys',
    nombre: 'Daenerys y Drogon',
    descripcion:
        'Ride exclusivo: la Madre de Dragones montada sobre Drogon, con sus '
        'ojos rojos encendidos y las alas membranosas desplegadas. Una pieza '
        'de gran formato que domina cualquier coleccion de Westeros.',
    precio: 65,
    imagen: 'assets/funkos/daenerys.jpg',
    color: Fk.violet,
    categoria: 'Series',
    rareza: 'Legendario',
  ),
  Producto(
    id: 'sora',
    nombre: 'Sora',
    descripcion:
        'El portador de la Llave Espada con su pelo rebelde y la Keyblade '
        'lista para sellar cerraduras entre mundos. Colores vibrantes y pose '
        'de combate. La nostalgia de Kingdom Hearts en estado puro.',
    precio: 33,
    imagen: 'assets/funkos/sora.jpg',
    color: Fk.cyan,
    categoria: 'Gaming',
    rareza: 'Epico',
  ),
  Producto(
    id: 'snake',
    nombre: 'Solid Snake',
    descripcion:
        'Modo sigilo activado. El legendario soldado con su bandana, traje '
        'tactico y cuchillo de combate, listo para infiltrarse sin ser '
        'detectado. Acabado realista que hara las delicias de cualquier fan '
        'de Metal Gear.',
    precio: 36,
    imagen: 'assets/funkos/snake.jpg',
    color: Fk.mint,
    categoria: 'Gaming',
    rareza: 'Epico',
  ),
  Producto(
    id: 'ahri',
    nombre: 'Ahri Espiritu Guardian',
    descripcion:
        'La zorra de nueve colas en su skin Spirit Blossom, con orejas '
        'felinas, cabello degradado rosa y un aura eterea. Detalles '
        'translucidos y pose elegante. Joya para coleccionistas de League '
        'of Legends.',
    precio: 40,
    imagen: 'assets/funkos/ahri.jpg',
    color: Fk.pink,
    categoria: 'League of Legends',
    rareza: 'Epico',
  ),
  Producto(
    id: 'jinx',
    nombre: 'Jinx',
    descripcion:
        'Pura locura azul. Jinx con sus largas trenzas, sonrisa traviesa y '
        'arsenal a cuestas. Energia caotica esculpida en vinilo. Si te gusta '
        'el desorden, esta es tu figura.',
    precio: 32,
    imagen: 'assets/funkos/jinx.jpg',
    color: Fk.cyan,
    categoria: 'League of Legends',
    rareza: 'Raro',
  ),
  Producto(
    id: 'byleth',
    nombre: 'Byleth',
    descripcion:
        'El profesor de ojos heterocromaticos de Garreg Mach, con la espada '
        'del Creador en mano y el uniforme de la Orden. Detalle fino en '
        'cinturones y armadura. Un fichaje estrella para fans de Fire Emblem.',
    precio: 34,
    imagen: 'assets/funkos/byleth.jpg',
    color: Fk.violet,
    categoria: 'Gaming',
    rareza: 'Raro',
  ),
  Producto(
    id: 'mulan',
    nombre: 'Mulan',
    descripcion:
        'La heroina de China con su elegante hanfu azul y dorado, flor en el '
        'cabello y mirada decidida. Bordados delicados pintados a mano. '
        'Clasico Disney que nunca pasa de moda.',
    precio: 30,
    imagen: 'assets/funkos/mulan.jpg',
    color: Fk.cyan,
    categoria: 'Disney',
    rareza: 'Raro',
  ),
  Producto(
    id: 'sombra',
    nombre: 'Sombra',
    descripcion:
        'La hacker mas escurridiza de Overwatch, con su cresta morada y traje '
        'de camuflaje optico. Tecnologia translucida y actitud rebelde. '
        'Hackea tu coleccion con esta pieza.',
    precio: 31,
    imagen: 'assets/funkos/sombra.jpg',
    color: Fk.violet,
    categoria: 'Gaming',
    rareza: 'Raro',
  ),
  Producto(
    id: 'oni',
    nombre: 'Samurai Oni',
    descripcion:
        'Guerrero de mascara demoniaca con cuernos carmesi y cabellera negra '
        'al viento, katana envainada y kimono de batalla. Una figura de '
        'fantasia japonesa con presencia imponente. Edicion de tirada '
        'limitada.',
    precio: 44,
    imagen: 'assets/funkos/oni.jpg',
    color: Fk.pink,
    categoria: 'Anime',
    rareza: 'Legendario',
  ),
];
