import express from "express";
import postController from "../controllers/postController.js";

const router = express.Router();

// Listar todos los posts
router.get("/", postController.getAll);

// Mostrar formulario de creación
router.get("/create", postController.showCreateForm);

// Crear nuevo post
router.post("/", postController.store);

// Mostrar formulario de edición
router.get("/:id/edit", postController.showEditForm);

// Actualizar post
router.post("/:id", postController.update);

// Eliminar post
router.post("/:id/delete", postController.delete);

export default router;

