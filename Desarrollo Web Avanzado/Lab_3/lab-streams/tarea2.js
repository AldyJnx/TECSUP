const http = require('http');
const ExcelJS = require('exceljs');

const PORT = 3000;

// Datos de ejemplo para la hoja de ventas
const datosVentas = [
    { producto: 'Laptop HP', cantidad: 15, precio: 2500.00 },
    { producto: 'Mouse Logitech', cantidad: 50, precio: 45.00 },
    { producto: 'Teclado Mecanico', cantidad: 30, precio: 120.00 },
    { producto: 'Monitor Samsung 24"', cantidad: 20, precio: 350.00 },
    { producto: 'Webcam HD', cantidad: 25, precio: 80.00 },
    { producto: 'Audifonos Bluetooth', cantidad: 40, precio: 65.00 },
    { producto: 'SSD 500GB', cantidad: 35, precio: 90.00 },
    { producto: 'RAM DDR4 16GB', cantidad: 28, precio: 75.00 },
    { producto: 'Cable HDMI 2m', cantidad: 100, precio: 15.00 },
    { producto: 'Hub USB 4 puertos', cantidad: 45, precio: 25.00 },
    { producto: 'Impresora Epson', cantidad: 12, precio: 280.00 },
    { producto: 'Tablet Samsung', cantidad: 18, precio: 450.00 },
    { producto: 'Cargador Universal', cantidad: 60, precio: 35.00 },
    { producto: 'Mousepad XL', cantidad: 55, precio: 20.00 },
    { producto: 'Memoria USB 64GB', cantidad: 80, precio: 18.00 },
    { producto: 'Disco Duro 1TB', cantidad: 22, precio: 65.00 },
    { producto: 'Router WiFi 6', cantidad: 16, precio: 120.00 },
    { producto: 'Parlantes PC', cantidad: 32, precio: 55.00 },
    { producto: 'Soporte Monitor', cantidad: 14, precio: 45.00 },
    { producto: 'Cooler Laptop', cantidad: 38, precio: 30.00 }
];

// Funcion para generar el Excel y enviarlo en streaming
async function generarExcelStream(res) {
    try {
        // Crear un nuevo workbook
        const workbook = new ExcelJS.Workbook();

        // Agregar la hoja "Ventas"
        const worksheet = workbook.addWorksheet('Ventas');

        // Configurar las columnas (cabeceras)
        worksheet.columns = [
            { header: 'Producto', key: 'producto', width: 25 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Precio', key: 'precio', width: 15 }
        ];

        // Estilo para la cabecera
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Agregar las filas de datos
        datosVentas.forEach(venta => {
            worksheet.addRow(venta);
        });

        // Formato para la columna de precio (moneda)
        worksheet.getColumn('precio').numFmt = '"$"#,##0.00';

        // Configurar cabeceras HTTP para forzar descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');

        // Escribir el Excel directamente al response (streaming)
        await workbook.xlsx.write(res);

        // Cerrar el stream
        res.end();

        console.log('Excel generado y enviado correctamente');

    } catch (error) {
        console.error('Error al generar el Excel:', error.message);

        // Si aun no se han enviado cabeceras, enviar error
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Error interno del servidor al generar el reporte');
        }
    }
}

// Crear el servidor HTTP
const server = http.createServer((req, res) => {
    const url = req.url;

    console.log(`Solicitud recibida: ${req.method} ${url}`);

    if (url === '/reporte') {
        // Ruta para generar y descargar el Excel
        generarExcelStream(res);
    } else {
        // Cualquier otra ruta muestra mensaje de ayuda
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Visita /reporte para descargar el Excel');
    }
});

// Manejo de errores del servidor
server.on('error', (error) => {
    console.error('Error en el servidor:', error.message);
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor HTTP iniciado en http://localhost:${PORT}`);
    console.log(`Visita http://localhost:${PORT}/reporte para descargar el Excel`);
    console.log('Presiona Ctrl+C para detener el servidor');
});
