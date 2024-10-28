const dashboardData = require('../handlers/admin_dashboard_data_handler');
const { checkToken } = require('../helpers/redisTransaction');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

module.exports = (app) => {
    app.get('/api/admin/get-dashboard-data/:id',(res,req) => dashboardData.handleDashboardFormData(res,req))
    app.get('/api/admin/get-dashboard-table-data/:id',(res,req) => dashboardData.handleDashboardTableData(res,req))
    app.get('/api/admin/get-print-lkf/:id', (res,req) => dashboardData.handlePrintData(res,req))

    app.get('/api/upload/template/:filename', (res, req) => {
        const filePath = path.join(__dirname, '../upload', req.getParameter(0));
        const theFile = toArrayBuffer(fs.readFileSync(filePath));
        res.end(theFile);
    });

    app.post('/api/admin/upload', (res,req) => dashboardData.handleUploadData(res,req))

    // app.get('/api/admin/upload', (res,req) => dashboardData.handleUploadData(res,req))
    // app.post('/upload', async (req, res) => {
    //     console.log("hello")
    //     // try {
    //     //   const { files } = req.body;
      
    //     //   if (!files || !files.data) {
    //     //     return res.status(400).send('File tidak ditemukan dalam request.');
    //     //   }
      
    //     //   // Mengonversi data Base64 ke Buffer
    //     //   const buffer = Buffer.from(files.data, 'base64');
      
    //     //   // Membuat workbook baru
    //     //   const workbook = new ExcelJS.Workbook();
    //     //   await workbook.xlsx.load(buffer); // Memuat workbook dari buffer
      
    //     //   // Mengambil sheet pertama
    //     //   const worksheet = workbook.worksheets[0];
      
    //     //   // Mengonversi data sheet menjadi array of objects
    //     //   const data = [];
    //     //   worksheet.eachRow((row, rowNumber) => {
    //     //     const rowData = {};
    //     //     row.eachCell((cell, colNumber) => {
    //     //       rowData[`Column${colNumber}`] = cell.value; // Anda bisa mengubah penamaan kolom sesuai kebutuhan
    //     //     });
    //     //     data.push(rowData);
    //     //   });
      
    //     //   // Mengembalikan data yang diproses ke frontend
    //     //   res.json(data);
    //     // } catch (error) {
    //     //   console.error(error);
    //     //   res.status(500).send('Terjadi kesalahan saat memproses file.');
    //     // }
    //   });

    // app.post('/api/upload', (res, req) => {
    //     let bufferArray = [];
    
    //     res.onAborted(() => {
    //         console.log('Permintaan dibatalkan oleh klien.');
    //     });
    
    //     res.onData((chunk, isLast) => {
    //         bufferArray.push(Buffer.from(chunk)); 
    
    //         if (isLast) {
    //             // Gabungkan seluruh data buffer
    //             const fileBuffer = Buffer.concat(bufferArray);
    
    //             // Membaca data dari file buffer menggunakan ExcelJS
    //             const workbook = new ExcelJS.Workbook();
    //             workbook.xlsx.load(fileBuffer).then(() => {
    //                 const worksheet = workbook.getWorksheet(1);
                    
    //                 let data = [];
    //                 worksheet.eachRow((row, rowNumber) => {
    //                     const rowData = row.values;
    //                     data.push(rowData);
    //                 });
    
    //                 // Lakukan pengelolaan data sesuai kebutuhan
    //                 console.log('Data yang diunggah:', data);
    
    //                 // Kirim respons sukses
    //                 res.writeStatus('200 OK').end('Data file berhasil dibaca.');
    //             }).catch((error) => {
    //                 // Tangani error jika terjadi saat membaca file
    //                 res.writeStatus('500 Internal Server Error').end('Gagal membaca file.');
    //                 console.error('Error saat membaca file:', error);
    //             });
    //         }
    //     });
    // });
}

function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}