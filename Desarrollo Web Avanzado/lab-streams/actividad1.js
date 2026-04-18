const fs = require('fs');

const readStream = fs.createReadStream('datos.txt', 'utf8');

readStream.on('data', (chunk) => {
    console.log('Chunk recibido:');
    console.log(chunk);
});

readStream.on('end', () => {
    console.log('Lectura finalizada');
});

readStream.on('error', (err) => {
    console.error('Error:', err);
});
