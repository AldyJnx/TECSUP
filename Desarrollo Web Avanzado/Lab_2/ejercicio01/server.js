const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Oli uu</h1>');
  } else if (req.url === '/about') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Acerca de</h1>');
  } else if (req.url === '/contact') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Contacto</h1>');
  } else if (req.url === '/services') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Servicios: Desarrollo Web, APIs, Seguridad</h1>');
  } else if (req.url === '/error') {
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.end('<h1>Error interno del servidor</h1>');
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('<h1>404 - No hay Naa</h1>');
  }
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});