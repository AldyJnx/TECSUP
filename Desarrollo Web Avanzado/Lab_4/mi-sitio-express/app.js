const express = require("express");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const mainRoutes = require("./routes/mainRoutes");
app.use("/", mainRoutes);

app.use((req, res) => {
  res.status(404).render("notFound", { url: req.originalUrl });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));