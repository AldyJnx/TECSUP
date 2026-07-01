/**
 * Registro Cloud Innovation Day
 * ------------------------------------------------------------------
 * Funcion Lambda unica (router) que gestiona todas las operaciones
 * de la API REST de estudiantes inscritos al evento.
 *
 * Endpoints atendidos (via API Gateway con integracion Lambda Proxy):
 *   POST   /estudiantes        -> registrar un nuevo estudiante
 *   GET    /estudiantes        -> listar todos los estudiantes
 *   GET    /estudiantes/{id}   -> consultar un estudiante por id
 *   DELETE /estudiantes/{id}   -> eliminar un estudiante por id
 *
 * Runtime recomendado: Node.js 20.x (el AWS SDK v3 ya viene incluido).
 * Tabla DynamoDB: EstudiantesEvento  (clave primaria: id, tipo String)
 * ------------------------------------------------------------------
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Cliente de DynamoDB. Se crea fuera del handler para reutilizarlo
// entre invocaciones (mejor rendimiento en entornos serverless).
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

// Nombre de la tabla. Se puede sobreescribir con una variable de
// entorno en la consola de Lambda; si no existe, usa el valor por defecto.
const TABLE_NAME = process.env.TABLE_NAME || "EstudiantesEvento";

// Campos obligatorios segun el enunciado del laboratorio.
const CAMPOS_OBLIGATORIOS = [
  "id",
  "nombres",
  "apellidos",
  "correo",
  "carrera",
  "ciclo",
  "fechaRegistro",
];

/**
 * Construye una respuesta HTTP compatible con API Gateway (Lambda Proxy).
 */
function respuesta(statusCode, cuerpo) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      // CORS abierto para poder probar desde una web simple o Postman.
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(cuerpo),
  };
}

/**
 * Punto de entrada de la funcion Lambda.
 */
export const handler = async (event) => {
  // Metodo HTTP y el id opcional que llega por la ruta /estudiantes/{id}.
  const metodo = event.httpMethod;
  const id = event.pathParameters ? event.pathParameters.id : undefined;

  try {
    switch (metodo) {
      // Responder a las peticiones CORS de tipo preflight.
      case "OPTIONS":
        return respuesta(200, { mensaje: "OK" });

      case "POST":
        return await registrarEstudiante(event);

      case "GET":
        // Si viene un id en la ruta -> consulta individual; si no -> listado.
        return id ? await consultarEstudiante(id) : await listarEstudiantes();

      case "DELETE":
        return await eliminarEstudiante(id);

      default:
        return respuesta(405, { mensaje: "Metodo no permitido" });
    }
  } catch (error) {
    // Cualquier error inesperado se registra en CloudWatch y se informa.
    console.error("Error no controlado:", error);
    return respuesta(500, { mensaje: "Error interno del servidor" });
  }
};

/**
 * POST /estudiantes -> registra un nuevo estudiante en DynamoDB.
 */
async function registrarEstudiante(event) {
  // El body llega como texto; se parsea a objeto.
  let datos;
  try {
    datos = event.body ? JSON.parse(event.body) : {};
  } catch {
    return respuesta(400, { mensaje: "El cuerpo de la peticion no es un JSON valido" });
  }

  // Validar que esten todos los campos obligatorios.
  const faltantes = CAMPOS_OBLIGATORIOS.filter(
    (campo) => datos[campo] === undefined || datos[campo] === null || datos[campo] === ""
  );
  if (faltantes.length > 0) {
    return respuesta(400, {
      mensaje: "Faltan campos obligatorios",
      campos: faltantes,
    });
  }

  // Guardar en DynamoDB. ConditionExpression evita sobreescribir un id existente.
  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: String(datos.id),
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          correo: datos.correo,
          carrera: datos.carrera,
          ciclo: String(datos.ciclo),
          fechaRegistro: datos.fechaRegistro,
        },
        ConditionExpression: "attribute_not_exists(id)",
      })
    );
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return respuesta(409, { mensaje: "Ya existe un estudiante con ese id" });
    }
    throw error;
  }

  return respuesta(201, {
    mensaje: "Estudiante registrado correctamente",
    id: String(datos.id),
  });
}

/**
 * GET /estudiantes -> devuelve la lista completa de estudiantes.
 */
async function listarEstudiantes() {
  const resultado = await dynamo.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );
  return respuesta(200, resultado.Items || []);
}

/**
 * GET /estudiantes/{id} -> devuelve un estudiante por su id.
 */
async function consultarEstudiante(id) {
  const resultado = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: String(id) },
    })
  );

  if (!resultado.Item) {
    return respuesta(404, { mensaje: "No se encontro el estudiante solicitado" });
  }
  return respuesta(200, resultado.Item);
}

/**
 * DELETE /estudiantes/{id} -> elimina un estudiante por su id.
 */
async function eliminarEstudiante(id) {
  if (!id) {
    return respuesta(400, { mensaje: "Debe indicar el id del estudiante" });
  }

  // ReturnValues ALL_OLD nos permite saber si el registro existia.
  const resultado = await dynamo.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: String(id) },
      ReturnValues: "ALL_OLD",
    })
  );

  if (!resultado.Attributes) {
    return respuesta(404, { mensaje: "No se encontro el estudiante solicitado" });
  }
  return respuesta(200, {
    mensaje: "Estudiante eliminado correctamente",
    id: String(id),
  });
}
