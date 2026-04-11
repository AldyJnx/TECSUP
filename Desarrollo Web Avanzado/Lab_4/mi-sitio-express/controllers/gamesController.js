// Base de datos en memoria para videojuegos
const games = [

];

let nextId = 4;

const index = (req, res) => {
  res.render("games", { games });
};

const save = (req, res) => {
  const { nombre, genero, anio, plataforma, calificacion, descripcion, imagen } = req.body;

  const newGame = {
    id: nextId++,
    nombre,
    genero,
    anio: parseInt(anio),
    plataforma,
    calificacion: parseFloat(calificacion),
    descripcion,
    imagen: imagen || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400"
  };

  games.push(newGame);
  res.redirect("/games");
};

const deleteGame = (req, res) => {
  const { id } = req.params;
  const index = games.findIndex(game => game.id === parseInt(id));

  if (index !== -1) {
    games.splice(index, 1);
  }

  res.redirect("/games");
};

module.exports = {
  index,
  save,
  deleteGame
};
