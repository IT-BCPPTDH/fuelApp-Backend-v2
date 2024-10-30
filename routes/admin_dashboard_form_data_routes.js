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
}

function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}