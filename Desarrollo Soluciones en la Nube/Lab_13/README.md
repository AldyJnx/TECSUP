# Agenda de Contactos

Aplicacion web para gestionar una agenda de contactos. Almacena los datos en
una base de datos **MySQL en Amazon RDS** y las fotos en **Cloudinary**.
Pensada para desplegarse en una instancia **Ubuntu de AWS (EC2)**.

## Caracteristicas

- Listar contactos con foto
- Crear contacto (con subida de imagen)
- Modificar contacto
- Eliminar contacto (borra tambien la imagen en Cloudinary)
- Buscar por apellido en tiempo real
- Interfaz oscura con estetica glassmorphism (Glow & Glass)

Datos de cada contacto: `id, nombre, apellidos, correo, fecha_nac, foto`.

## Stack

- Node.js + Express
- MySQL (`mysql2`) sobre Amazon RDS
- Cloudinary para el almacenamiento de imagenes
- Frontend en HTML/CSS/JS sin frameworks

## Estructura

```
src/
  server.js      API REST y servidor estatico
  db.js          Pool de conexiones MySQL
  cloudinary.js  Subida/borrado de imagenes
  init-db.js     Crea la base de datos y la tabla
public/
  index.html     Interfaz
  styles.css     Estilos glassmorphism
  app.js         Logica del cliente
schema.sql       Esquema de la tabla
```

## Configuracion local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar los valores:

   ```bash
   cp .env.example .env
   ```

3. Crear la base de datos y la tabla:

   ```bash
   npm run init-db
   ```

4. Iniciar el servidor:

   ```bash
   npm start
   ```

   Abrir http://localhost:3000

## Despliegue en AWS

### 1. Base de datos RDS (MySQL)

1. Consola de AWS > RDS > Crear base de datos > MySQL.
2. Plantilla "Capa gratuita" (Free tier).
3. Definir identificador, usuario maestro y contrasena.
4. En "Acceso publico" elegir **Si** si se conectara desde fuera de la VPC.
5. En el grupo de seguridad, permitir el puerto **3306** desde la IP de la
   instancia EC2 (o desde tu IP para pruebas).
6. Copiar el **endpoint** de la instancia y usarlo como `DB_HOST` en `.env`.

### 2. Instancia EC2 (Ubuntu)

```bash
# Conectar por SSH
ssh -i clave.pem ubuntu@IP_PUBLICA

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clonar y configurar el proyecto
git clone <url-del-repo>
cd Lab_13
npm install
cp .env.example .env
nano .env          # completar credenciales de RDS y Cloudinary

# Inicializar la base de datos
npm run init-db

# Ejecutar de forma persistente con PM2
sudo npm install -g pm2
pm2 start src/server.js --name agenda
pm2 save
pm2 startup
```

Abrir el puerto **3000** en el grupo de seguridad de la instancia EC2 para
acceder desde el navegador en `http://IP_PUBLICA:3000`.

### 3. Cloudinary

1. Crear una cuenta gratuita en https://cloudinary.com
2. En el Dashboard copiar `Cloud name`, `API Key` y `API Secret`.
3. Completar esos valores en `.env`.

## API

| Metodo | Ruta                          | Descripcion                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/contactos`              | Listar todos                 |
| GET    | `/api/contactos?apellido=xxx` | Buscar por apellido          |
| GET    | `/api/contactos/:id`          | Obtener uno                  |
| POST   | `/api/contactos`              | Crear (multipart con `foto`) |
| PUT    | `/api/contactos/:id`          | Modificar                    |
| DELETE | `/api/contactos/:id`          | Eliminar                     |

## Conclusiones

- Las bases de datos **relacionales (RDS/MySQL)** son ideales cuando los datos
  tienen una estructura fija y relaciones claras, como la agenda de contactos:
  cada registro comparte las mismas columnas y se consulta con SQL. Las
  **NoSQL (DynamoDB)** convienen cuando el esquema es flexible o se necesita
  escalar horizontalmente con accesos por clave.
- Usar una base de datos **como servicio (RDS)** elimina la carga de instalar,
  parchear y respaldar el motor manualmente; basta con configurar el endpoint,
  el usuario y el grupo de seguridad para conectarse desde la aplicacion.
- Separar el **almacenamiento de archivos** (fotos) del almacenamiento de datos
  es una buena practica en la nube: la base de datos guarda solo la URL de la
  imagen, mientras el binario vive en un servicio especializado (S3/Cloudinary).
  Esto mantiene la base de datos ligera y mejora el rendimiento.
- El **grupo de seguridad** es la pieza clave de la conectividad en AWS: hay que
  abrir explicitamente el puerto 3306 hacia la instancia EC2 y el puerto de la
  aplicacion hacia internet; de lo contrario la conexion es rechazada.
- Probar localmente con **Docker** antes de desplegar en AWS acelera el
  desarrollo: el mismo codigo que apunta a un MySQL en contenedor funciona sin
  cambios contra RDS, solo modificando las variables de entorno.
- Una arquitectura desacoplada (**EC2 + RDS + almacenamiento de objetos**)
  permite escalar cada componente por separado y refleja un diseño realista de
  aplicaciones en la nube.

