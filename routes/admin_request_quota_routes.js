const unitReq = require('../handlers/admin_unit_request_handler');
const { checkToken } = require('../helpers/redisTransaction');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    app.get('/api/admin/get-request-summary/:tanggal',(res,req) => unitReq.handleUnitReqSummary(res,req))
    app.post('/api/admin/get-request-table',(res,req) => unitReq.handleUnitReqTable(res,req))
    app.post('/api/admin/add-quota',(res,req) => unitReq.handleUnitReqInsert(res,req))

    app.get('/api/img/req/:name', (res, req) => {
        res.onAborted(() => {
            console.error('Request aborted by the client.');
        });
    
        const params = req.getParameter(0);
        const imagePath = path.join(__dirname, '../assets/request-kuota/', params);
    
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

    // app.get('/api/img/req/:name', async (res, req) => {
    //     res.cork(async() =>{
    //         try{
    //             const params = await req.getParameter(0)
    //             const imagePath = path.join(__dirname, '../assets/request-kuota/',params); 
    //             fs.readFile(imagePath, (err, data) => {
    //                 if (err) {
    //                     res.cork(() => {
    //                         res
    //                             .writeStatus('404')
    //                             .end('Image not found');
    //                     });
    //                     // res.writeStatus('404 Not Found');
    //                     // res.end('Image not found');
    //                     return;
    //                 }

    //                 res.cork(() => {
    //                     res
    //                         .writeHeader('Access-Control-Allow-Origin', '*')
    //                         .writeHeader('Content-Type', 'image/png')
    //                         .writeStatus('200')
    //                         .end(JSON.stringify(data));
    //                 });
            
    //                 // res.writeHeader('Access-Control-Allow-Origin', '*')
    //                 // res.writeHeader('Content-Type', 'image/png');
    //                 // res.end(data);
    //             });
            
    //             res.onAborted(() => {
    //                 res.aborted = true;
    //             });
    //         }catch(error){
    //             res.cork(() => {
    //                 res
    //                     .writeStatus('500')
    //                     .end('Failed to retrieve files');
    //             });
    //             // console.error('Error reading files:', error);
    //             // res.writeStatus('500 Internal Server Error');
    //             // res.end('Failed to retrieve files');
    //         }
    //     })
    // });
}