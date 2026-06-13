const mysql = require('mysql2/promise');
require('dotenv').config();

// Crea la base de datos y la tabla de contactos en RDS
async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'agenda';

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.query(`USE \`${dbName}\`;`);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS contactos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      correo VARCHAR(150) NOT NULL,
      fecha_nac DATE,
      foto_url VARCHAR(500),
      foto_public_id VARCHAR(200),
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Base de datos y tabla "contactos" listas.');
  await connection.end();
}

main().catch((err) => {
  console.error('Error al inicializar la base de datos:', err.message);
  process.exit(1);
});
