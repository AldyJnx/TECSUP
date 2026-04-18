const fs = require('fs');
const { Transform } = require('stream');

const readStream = fs.createReadStream('texto.txt', 'utf8');
const writeStream = fs.createWriteStream('texto_mayusculas.txt');

const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }
});

readStream
    .pipe(upperCaseTransform)
    .pipe(writeStream);

writeStream.on('finish', () => {
    console.log('Transformación completa');
});
