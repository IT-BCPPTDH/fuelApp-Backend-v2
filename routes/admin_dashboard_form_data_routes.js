const dashboardData = require('../handlers/admin_dashboard_data_handler');
const { checkToken } = require('../helpers/redisTransaction');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    app.get('/api/admin/get-dashboard-data/:id',(res,req) => dashboardData.handleDashboardFormData(res,req))
    app.get('/api/admin/get-dashboard-table-data/:id',(res,req) => dashboardData.handleDashboardTableData(res,req))
    app.get('/api/admin/get-print-lkf/:id', (res,req) => dashboardData.handlePrintData(res,req))
    
    app.get('/api/img/flowmeter/:name', (res, req) => {
        res.onAborted(() => {
            console.error('Request aborted by the client.');
        });
    
        const params = req.getParameter(0);
        const imagePath = path.join(__dirname, '../assets/flowmeter/', params);

        if (!fs.existsSync(imagePath)) {
            res.cork(() => {
                res.writeStatus('404 Not Found')
                   .writeHeader('Access-Control-Allow-Origin', '*')
                   .end('Image not found');
            });
            return;
        }
    
        fs.readFile(imagePath, (err, data) => {
            res.cork(() => {
                if (err) {
                    console.error('Error reading file:', err);
                    res.writeStatus('404 Not Found')
                       .writeHeader('Access-Control-Allow-Origin', '*')
                       .end('Image not found');
                    return;
                }
    
                res.writeStatus('200 OK')
                   .writeHeader('Access-Control-Allow-Origin', '*')
                   .writeHeader('Content-Type', 'image/png')
                   .end(data);
            });
        });
    });

    app.get('/api/img/signature/:name', (res, req) => {
        res.onAborted(() => {
            console.error('Request aborted by the client.');
        });
    
        const params = req.getParameter(0);
        const imagePath = path.join(__dirname, '../assets/signature/', params);

        if (!fs.existsSync(imagePath)) {
            res.cork(() => {
                res.writeStatus('404 Not Found')
                   .writeHeader('Access-Control-Allow-Origin', '*')
                   .end('Image not found');
            });
            return;
        }
        
        fs.readFile(imagePath, (err, data) => {
            res.cork(() => {
                if (err) {
                    console.error('Error reading file:', err);
                    res.writeStatus('404 Not Found')
                       .writeHeader('Access-Control-Allow-Origin', '*')
                       .end('Image not found');
                    return;
                }
    
                res.writeStatus('200 OK')
                   .writeHeader('Access-Control-Allow-Origin', '*')
                   .writeHeader('Content-Type', 'image/png')
                   .end(data);
            });
        });
    });
    
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