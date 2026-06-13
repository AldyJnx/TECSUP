const pool = require('./db');

// Contactos de ejemplo con fotos publicas (pravatar.cc)
const contactos = [
  ['Ana', 'Garcia Lopez', 'ana.garcia@mail.com', '1998-05-12', 'https://i.pravatar.cc/300?img=5'],
  ['Luis', 'Torres Ramos', 'luis.torres@mail.com', '1995-11-03', 'https://i.pravatar.cc/300?img=12'],
  ['Maria', 'Fernandez Soto', 'maria.fernandez@mail.com', '2000-02-21', 'https://i.pravatar.cc/300?img=47'],
  ['Carlos', 'Mendoza Vega', 'carlos.mendoza@mail.com', '1993-08-17', 'https://i.pravatar.cc/300?img=33'],
  ['Lucia', 'Rojas Diaz', 'lucia.rojas@mail.com', '1999-12-30', 'https://i.pravatar.cc/300?img=20'],
  ['Diego', 'Salazar Cruz', 'diego.salazar@mail.com', '1996-04-09', 'https://i.pravatar.cc/300?img=15']
];

async function main() {
  for (const [nombre, apellidos, correo, fecha_nac, foto_url] of contactos) {
    await pool.query(
      `INSERT INTO contactos (nombre, apellidos, correo, fecha_nac, foto_url)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellidos, correo, fecha_nac, foto_url]
    );
  }
  console.log(`${contactos.length} contactos de ejemplo insertados.`);
  await pool.end();
}

main().catch((err) => {
  console.error('Error al insertar datos de ejemplo:', err.message);
  process.exit(1);
});
