const fs = require('fs');

const writeStream = fs.createWriteStream('salida.txt');

writeStream.write('Primera línea\n');
writeStream.write('Segunda línea\n');
writeStream.write('Tercera línea\n');

writeStream.end('Fin del archivo\n');

writeStream.on('finish', () => {
    console.log('Archivo escrito correctamente');
});

writeStream.on('error', (err) => {
    console.error('Error:', err);
});
