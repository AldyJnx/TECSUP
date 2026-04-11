// "Base de datos" en memoria
const messages = [];

// Inicio
const home = (req, res) => {
  res.render("home", { title: "Inicio" });
};

// About
const about = (req, res) => {
  res.render("about", { title: "Acerca de" });
};

// Contacto
const contact = (req, res) => {
  res.render("contact");
};

// Guardar contacto
const saveContact = (req, res) => {
  const { nombre, email, mensaje } = req.body;

  messages.push({ nombre, email, mensaje });

  res.redirect("/admin");
};

// Admin
const admin = (req, res) => {
  res.render("admin", { messages });
};

module.exports = {
  home,
  about,
  contact,
  saveContact,
  admin
};