const http = require('http');
const ExcelJS = require('exceljs');

const server = http.createServer(async (req, res) => {
    if (req.url === '/reporte') {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ventas');

            worksheet.columns = [
                { header: 'Producto', key: 'producto' },
                { header: 'Cantidad', key: 'cantidad' },
                { header: 'Precio', key: 'precio' }
            ];

            for (let i = 1; i <= 20; i++) {
                worksheet.addRow({
                    producto: `Producto ${i}`,
                    cantidad: Math.floor(Math.random() * 10) + 1,
                    precio: (Math.random() * 100).toFixed(2)
                });
            }

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename="reporte.xlsx"'
            );

            await workbook.xlsx.write(res);

            res.end();

        } catch (error) {
            res.statusCode = 500;
            res.end('Error generando el Excel');
        }
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Visita /reporte para descargar el Excel');
    }
});

server.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
