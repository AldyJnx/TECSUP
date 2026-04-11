const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const gamesController = require("../controllers/gamesController");

router.get("/", mainController.home);
router.get("/about", mainController.about);

router.get("/contact", mainController.contact);
router.post("/contact", mainController.saveContact);
router.get("/admin", mainController.admin);

router.get("/games", gamesController.index);
router.post("/games", gamesController.save);
router.post("/games/:id/delete", gamesController.deleteGame);

module.exports = router;