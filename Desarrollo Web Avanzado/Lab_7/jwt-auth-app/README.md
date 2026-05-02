# JWT Auth App - Lab 07

Aplicacion fullstack que implementa autenticacion basada en JWT, gestion de
usuarios con roles (`user` / `admin`) y un frontend en EJS con un diseno
elegante y minimalista (CSS personalizado, sin dependencias UI pesadas, sin
emojis).

> Curso: Desarrollo Web Avanzado - Seccion A-B - 5 C24
> Estudiante: Edwin William Arevalo Sermeno

## Stack

- **Backend:** Node.js, Express, Mongoose, JSON Web Token, bcrypt, dotenv, cors
- **Frontend:** EJS + CSS custom (sistema de design minimalista)
- **Base de datos:** MongoDB local (`auth_db`)

## Arquitectura

```
src/
  models/         Mongoose schemas (User, Role)
  repositories/   Acceso a datos (UserRepository, RoleRepository)
  services/       Reglas de negocio (AuthService, UserService)
  controllers/    Capa HTTP (AuthController, UserController)
  middlewares/    authenticate (JWT), authorize (roles)
  routes/         API y vistas
  utils/          seedRoles, seedUsers
  views/          EJS (signin, signup, profile, dashboards, 403, 404)
  public/         CSS y JS del cliente (auth.js)
  server.js       Bootstrap de Express + Mongo
```

## Requisitos previos

- Node.js >= 18
- MongoDB en `mongodb://localhost:27017` (o ajusta `MONGO_URI`)

## Configuracion

1. Copia `.env.example` a `.env` y ajusta los valores. Por defecto:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/auth_db
   JWT_SECRET=tecsup_dwa_jwt_secret_2026
   JWT_EXPIRES=2h
   BCRYPT_SALT_ROUNDS=10

   ADMIN_EMAIL=admin@tecsup.edu.pe
   ADMIN_PASSWORD=Admin1234
   ADMIN_NAME=Edwin
   ADMIN_LASTNAME=Arevalo
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Al iniciar, `seedRoles()` crea los roles `user` y `admin`, y `seedUsers()`
   crea un administrador por defecto si no existe.

## Credenciales por defecto

- **Admin:** `admin@tecsup.edu.pe` / `Admin1234`
- Cualquier usuario nuevo se registra con rol `user`.

## Endpoints API

| Metodo | Ruta              | Auth        | Rol       | Descripcion                                 |
| ------ | ----------------- | ----------- | --------- | ------------------------------------------- |
| POST   | /api/auth/signUp  | -           | -         | Registro de usuarios                        |
| POST   | /api/auth/signIn  | -           | -         | Login, retorna `token` y `roles`            |
| GET    | /api/users/me     | Bearer JWT  | user/admin| Devuelve el usuario autenticado             |
| PUT    | /api/users/me     | Bearer JWT  | user/admin| Actualiza datos del usuario autenticado     |
| GET    | /api/users        | Bearer JWT  | admin     | Lista todos los usuarios                    |
| GET    | /api/users/:id    | Bearer JWT  | admin     | Detalle de un usuario                       |
| PUT    | /api/users/:id    | Bearer JWT  | admin     | Actualiza un usuario                        |
| DELETE | /api/users/:id    | Bearer JWT  | admin     | Elimina un usuario                          |

## Vistas

| Ruta                 | Descripcion                                       |
| -------------------- | ------------------------------------------------- |
| `/signIn`            | Inicio de sesion                                  |
| `/signUp`            | Registro de usuario                               |
| `/profile`           | Mi cuenta (consultar y editar)                    |
| `/dashboard`         | Panel del usuario (rol `user`+)                   |
| `/admin`             | Panel del administrador (rol `admin`)             |
| `/admin/users/:id`   | Detalle de un usuario para administradores        |
| `/403`               | Acceso denegado                                   |
| `*`                  | 404 - No encontrada                               |

## Reglas de navegacion

- El token JWT se guarda en `sessionStorage` con la clave `jwt_token`.
- En cada peticion al backend se envia `Authorization: Bearer <token>`.
- Si no hay token o expiro, el cliente cierra sesion y redirige a `/signIn`.
- Si un usuario sin rol suficiente entra al panel admin, se le redirige a
  `/403`.
- El backend valida `authenticate` + `authorize(['admin'])` en las rutas
  protegidas.

## Scripts npm

- `npm run dev` - servidor con recarga automatica (nodemon)
- `npm start`   - servidor en modo produccion

## Estructura de la UI

Diseno minimalista con paleta neutra (off-white + carbon), tipografia Inter,
componentes reutilizables (`.card`, `.btn`, `.field`, `.badge`, `.table`,
`.stat`) definidos en `public/css/styles.css`. Sin frameworks UI ni emojis.

## Pruebas rapidas con curl

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/signUp \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","lastName":"Diaz","email":"ana@correo.com","password":"123456"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/signIn \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tecsup.edu.pe","password":"Admin1234"}' | jq -r .token)

# Perfil
curl http://localhost:3000/api/users/me -H "Authorization: Bearer $TOKEN"

# Listar (solo admin)
curl http://localhost:3000/api/users -H "Authorization: Bearer $TOKEN"
```
