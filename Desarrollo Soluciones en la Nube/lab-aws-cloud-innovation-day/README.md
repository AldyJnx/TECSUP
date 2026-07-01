# Registro Cloud Innovation Day — Guía de despliegue (AWS Consola)

Aplicación serverless para registrar, listar, consultar y eliminar estudiantes
inscritos al evento **Cloud Innovation Day**, usando **AWS Lambda + API Gateway +
DynamoDB + IAM + CloudWatch**.

- **Lenguaje:** Node.js 20.x (AWS SDK v3)
- **Arquitectura:** una sola función Lambda (router) para las 4 operaciones
- **Región sugerida:** `us-east-1` (N. Virginia) — usa siempre la MISMA en todos los pasos

---

## 1. Diagrama de arquitectura

```
        ┌─────────────────────────────┐
        │   Cliente / Postman / Web    │
        │  (POST, GET, DELETE HTTP)    │
        └──────────────┬──────────────┘
                       │  HTTPS (REST)
                       ▼
        ┌─────────────────────────────┐
        │      Amazon API Gateway      │
        │   Recursos: /estudiantes     │
        │            /estudiantes/{id} │
        └──────────────┬──────────────┘
                       │  Lambda Proxy Integration
                       ▼
        ┌─────────────────────────────┐        ┌────────────────────────┐
        │         AWS Lambda           │───────▶│   Amazon CloudWatch    │
        │   Función router (Node.js)   │  logs  │   (Logs y métricas)    │
        │   handler -> index.handler   │        └────────────────────────┘
        └──────────────┬──────────────┘
                       │  AWS SDK v3 (PutItem/GetItem/Scan/DeleteItem)
                       ▼
        ┌─────────────────────────────┐
        │      Amazon DynamoDB         │
        │   Tabla: EstudiantesEvento   │
        │   Clave primaria: id (String)│
        └─────────────────────────────┘

  Permisos: el rol IAM de la Lambda autoriza el acceso a DynamoDB y CloudWatch.
```

> Para el informe puedes copiar este diagrama o recrearlo en draw.io / PowerPoint.

---

## 2. Crear la tabla en DynamoDB

1. Consola AWS → busca **DynamoDB** → **Tablas** → **Crear tabla**.
2. **Nombre de la tabla:** `EstudiantesEvento`
3. **Clave de partición (Partition key):** `id` — tipo **String**.
4. Deja **Sin clave de ordenación**.
5. Configuración: **Ajustes predeterminados** (On-demand está bien para el lab).
6. Clic en **Crear tabla**.
7. **Captura para el informe:** la tabla creada con estado *Active*.

---

## 3. Crear el rol IAM para la Lambda

> Se puede crear el rol antes, o dejar que Lambda cree uno básico y luego añadirle
> la política. Aquí lo creamos explícito (más claro para el informe).

1. Consola AWS → **IAM** → **Roles** → **Crear rol**.
2. **Tipo de entidad de confianza:** Servicio de AWS → **Lambda** → Siguiente.
3. En permisos, de momento no añadas nada (o busca `AWSLambdaBasicExecutionRole`
   para los logs) → Siguiente.
4. **Nombre del rol:** `rol-lambda-estudiantes` → **Crear rol**.
5. Abre el rol recién creado → pestaña **Permisos** → **Agregar permisos** →
   **Crear política insertada (inline)**.
6. Pestaña **JSON**, pega el contenido de [`iam/policy-dynamodb-cloudwatch.json`](iam/policy-dynamodb-cloudwatch.json):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermisosDynamoDB",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:Scan", "dynamodb:DeleteItem"],
      "Resource": "arn:aws:dynamodb:*:*:table/EstudiantesEvento"
    },
    {
      "Sid": "PermisosCloudWatchLogs",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

7. Nómbrala `politica-estudiantes` → **Crear política**.
8. **Captura para el informe:** el rol con la política adjunta.

---

## 4. Crear la función Lambda

1. Consola AWS → **Lambda** → **Crear función**.
2. **Crear desde cero**.
3. **Nombre:** `fn-estudiantes-evento`
4. **Runtime:** **Node.js 20.x**
5. **Arquitectura:** x86_64 (por defecto).
6. **Permisos** → *Cambiar rol de ejecución predeterminado* → **Usar un rol existente**
   → selecciona `rol-lambda-estudiantes`.
7. **Crear función**.

### Cargar el código

1. En la pestaña **Código**, borra el contenido del archivo generado.
2. **Importante (ESM):** el archivo del proyecto se llama `index.mjs`. En la consola,
   el archivo por defecto es `index.mjs` con Node 20, así que pega directamente el
   contenido de [`src/index.mjs`](src/index.mjs).
   - Si tu editor muestra `index.js`, renómbralo a `index.mjs` **o** pega el código y
     en **Configuración en tiempo de ejecución → Controlador (Handler)** deja
     `index.handler`.
3. Pega el contenido de `src/index.mjs`.
4. Clic en **Deploy** (Implementar).
5. (Opcional) **Configuración → Variables de entorno** → añade `TABLE_NAME` =
   `EstudiantesEvento` (el código ya usa ese valor por defecto si no la defines).
6. **Captura para el informe:** el editor de Lambda con el código y el botón *Deploy*.

### Probar rápido dentro de Lambda (opcional pero útil)

1. Pestaña **Probar** → crear evento de prueba con este JSON (simula un POST):

```json
{
  "httpMethod": "POST",
  "pathParameters": null,
  "body": "{\"id\":\"E001\",\"nombres\":\"Luis Angel\",\"apellidos\":\"Campos Valenzuela\",\"correo\":\"luis.campos@tecsup.edu.pe\",\"carrera\":\"Diseno y Desarrollo de Software\",\"ciclo\":\"5\",\"fechaRegistro\":\"2026-06-30\"}"
}
```

2. Clic en **Probar** → debe responder `201` con el mensaje de registro correcto.

---

## 5. Crear la API en API Gateway

Usaremos **REST API** con integración **Lambda Proxy** (pasa el evento completo a la
función, que es lo que espera el código).

1. Consola AWS → **API Gateway** → **Crear API** → **REST API** (no la privada) → **Compilar**.
2. **Nombre:** `api-estudiantes` → **Crear API**.

### Recurso /estudiantes

3. **Acciones** → **Crear recurso**.
4. **Nombre del recurso:** `estudiantes` → activa **CORS** → **Crear recurso**.

### Métodos POST y GET sobre /estudiantes

5. Selecciona el recurso `/estudiantes` → **Crear método** → **POST**.
   - Tipo de integración: **Función Lambda**
   - Activa **Integración de proxy de Lambda**
   - Función: `fn-estudiantes-evento` → Guardar (acepta dar permisos).
6. Repite para el método **GET** sobre `/estudiantes` (misma función, proxy activado).

### Recurso /estudiantes/{id}

7. Selecciona `/estudiantes` → **Crear recurso**.
8. **Nombre del recurso:** `id`  →  **Ruta del recurso:** `{id}` (con llaves) →
   activa CORS → **Crear recurso**.
9. Sobre `/{id}` crea el método **GET** (proxy Lambda, misma función).
10. Sobre `/{id}` crea el método **DELETE** (proxy Lambda, misma función).

### Desplegar la API

11. **Acciones** → **Desplegar API**.
12. **Etapa (Stage):** *[Nueva etapa]* → nombre `prod` → **Desplegar**.
13. Copia la **Invoke URL** que aparece arriba, por ejemplo:
    `https://abc123.execute-api.us-east-1.amazonaws.com/prod`
    → **esta es tu URL base** (la del entregable).
14. **Captura para el informe:** la estructura de recursos/métodos y la Invoke URL.

---

## 6. Probar la API (Postman / Thunder Client)

1. Importa la colección [`postman/CloudInnovationDay.postman_collection.json`](postman/CloudInnovationDay.postman_collection.json).
2. Edita la variable `baseUrl` de la colección y pon tu Invoke URL + `/prod`
   (sin barra final). Ejemplo: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`.
3. Ejecuta en orden y toma capturas:

| # | Petición | Método | URL | Resultado esperado |
|---|----------|--------|-----|--------------------|
| 1 | Registrar | POST | `{{baseUrl}}/estudiantes` | `201` + `{ "mensaje": "Estudiante registrado correctamente", "id": "E001" }` |
| 2 | Listar | GET | `{{baseUrl}}/estudiantes` | `200` + arreglo con el/los estudiantes |
| 3 | Consultar | GET | `{{baseUrl}}/estudiantes/E001` | `200` + objeto del estudiante |
| 4 | No encontrado | GET | `{{baseUrl}}/estudiantes/E999` | `404` + `{ "mensaje": "No se encontro el estudiante solicitado" }` |
| 5 | Eliminar | DELETE | `{{baseUrl}}/estudiantes/E001` | `200` + mensaje de eliminación |

Body de ejemplo para el POST (ya incluido en la colección):

```json
{
  "id": "E001",
  "nombres": "Luis Angel",
  "apellidos": "Campos Valenzuela",
  "correo": "luis.campos@tecsup.edu.pe",
  "carrera": "Diseno y Desarrollo de Software",
  "ciclo": "5",
  "fechaRegistro": "2026-06-30"
}
```

---

## 7. Evidencia de logs en CloudWatch

1. Consola AWS → **CloudWatch** → **Logs** → **Grupos de logs**.
2. Abre el grupo `/aws/lambda/fn-estudiantes-evento`.
3. Entra al último *Log stream* → verás las invocaciones (START, END, REPORT y
   cualquier `console.error`).
4. **Captura para el informe.**

---

## 8. Limpieza de recursos (obligatorio al finalizar)

Para no generar costos, elimina en este orden:

1. **API Gateway:** elimina la API `api-estudiantes`.
2. **Lambda:** elimina la función `fn-estudiantes-evento`.
3. **DynamoDB:** elimina la tabla `EstudiantesEvento`.
4. **CloudWatch:** elimina el grupo de logs `/aws/lambda/fn-estudiantes-evento`.
5. **IAM:** elimina el rol `rol-lambda-estudiantes` y la política insertada.

---

## 9. Estructura del entregable

```
lab-aws-cloud-innovation-day/
├── README.md                                   # esta guía
├── src/
│   └── index.mjs                               # código fuente de la Lambda
├── iam/
│   └── policy-dynamodb-cloudwatch.json         # política IAM
└── postman/
    └── CloudInnovationDay.postman_collection.json  # colección de pruebas
```

Sube esta carpeta a un repositorio GitHub o compártela como `.zip`, junto con la
**URL base de la API** y el informe (PDF/Word) con las capturas indicadas.
