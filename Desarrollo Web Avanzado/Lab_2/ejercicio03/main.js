const http = require("http");
const repo = require("./repository/studentsRepository");

const PORT = 4000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const { method, url } = req;

  // GET /students
  if (url === "/students" && method === "GET") {
    res.statusCode = 200;
    return res.end(JSON.stringify(repo.getAll()));
  }

  // GET /students/:id
  if (url.startsWith("/students/") && method === "GET") {
    const id = parseInt(url.split("/")[2]);
    const student = repo.getById(id);

    if (student) {
      res.statusCode = 200;
      return res.end(JSON.stringify(student));
    }
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
  }

  // POST /students
  if (url === "/students" && method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body);
      const result = repo.create(data);

      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result));
      }

      res.statusCode = 201;
      return res.end(JSON.stringify(result));
    });
    return;
  }

  // PUT /students/:id
  if (url.startsWith("/students/") && method === "PUT") {
    const id = parseInt(url.split("/")[2]);
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const updated = repo.update(id, JSON.parse(body));

      if (updated) {
        res.statusCode = 200;
        return res.end(JSON.stringify(updated));
      }

      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
    });
    return;
  }

  // DELETE /students/:id
  if (url.startsWith("/students/") && method === "DELETE") {
    const id = parseInt(url.split("/")[2]);
    const deleted = repo.remove(id);

    if (deleted) {
      res.statusCode = 200;
      return res.end(JSON.stringify(deleted));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
  }


  if (url === "/ListByStatus" && method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { status } = JSON.parse(body);
      const result = repo.listByStatus(status);

      res.statusCode = 200;
      return res.end(JSON.stringify(result));
    });
    return;
  }


  if (url === "/ListByGrade" && method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { gpa } = JSON.parse(body);
      const result = repo.listByGrade(gpa);

      res.statusCode = 200;
      return res.end(JSON.stringify(result));
    });
    return;
  }

  // Ruta no encontrada
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

server.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});