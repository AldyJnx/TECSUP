const fs = require('fs');

const readStream = fs.createReadStream('datos.txt');
const writeStream = fs.createWriteStream('copia.txt');

readStream.on('data', (chunk) => {
    const canWrite = writeStream.write(chunk);

    if (!canWrite) {
        readStream.pause();
        console.log('Pausado por backpressure');
    }
});

writeStream.on('drain', () => {
    console.log('Reanudando lectura');
    readStream.resume();
});

readStream.on('end', () => {
    writeStream.end();
});

readStream.on('error', console.error);
writeStream.on('error', console.error);
