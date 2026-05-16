const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('\n=== LAB STREAMS - NODE.JS ===');
    console.log('1. Actividad 1: Lectura de archivo con Streams');
    console.log('2. Actividad 2: Escritura con Streams');
    console.log('3. Actividad 3: Compresion con Pipes');
    console.log('4. Actividad 4: Manejo de errores y Backpressure');
    console.log('5. Tarea 1: Convertir texto a MAYUSCULAS');
    console.log('6. Tarea 2: Generar Excel con Streams + HTTP');
    console.log('0. Salir');
    console.log('================================\n');
}

function executeFile(file) {
    exec(`node ${file}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(stdout);
        askOption();
    });
}

function askOption() {
    rl.question('Selecciona una opcion: ', (option) => {
        switch(option) {
            case '1':
                executeFile('actividad1.js');
                break;
            case '2':
                executeFile('actividad2.js');
                break;
            case '3':
                executeFile('actividad3.js');
                break;
            case '4':
                executeFile('actividad4.js');
                break;
            case '5':
                executeFile('tarea1.js');
                break;
            case '6':
                console.log('Iniciando servidor HTTP...');
                console.log('Visita http://localhost:3000/reporte para descargar el Excel');
                executeFile('tarea2.js');
                break;
            case '0':
                console.log('Saliendo...');
                rl.close();
                break;
            default:
                console.log('Opcion invalida');
                askOption();
        }
    });
}

showMenu();
askOption();
