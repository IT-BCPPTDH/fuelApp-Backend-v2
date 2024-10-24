const downloadLkf = require('../handlers/admin_report_handler');
const { checkToken } = require('../helpers/redisTransaction');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    app.post('/api/admin/download-lkf',(res,req) => downloadLkf.handleDownload(res,req))
    app.post('/api/admin/download-station',(res,req) => downloadLkf.handleDownloadStation(res,req))
    app.post('/api/admin/download-lkf-excel',(res,req) => downloadLkf.handleDownloadLkf(res,req))
    app.post('/api/admin/download-lkf-elipse',(res,req) => downloadLkf.handleDownloadElipseLkf(res,req))
    app.post('/api/admin/daily-consumtion',(res,req) => downloadLkf.handleDownloadDaily(res,req))
    app.get('/api/admin/daily',(res,req) => downloadLkf.handleDownloadDailys(res,req))

    app.get('/api/downloads/:filename', (res, req) => {
        const filePath = path.join(__dirname, '../download', req.getParameter(0));
        const theFile = toArrayBuffer(fs.readFileSync(filePath));
        res.end(theFile);
    });    
    // app.post('/api/admin/get-dashboard-table',(res,req) => dashboard.handleDashboardTable(res,req))
}

function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}