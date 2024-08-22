const unitReq = require('../handlers/admin_unit_request_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.get('/api/admin/get-request-summary/:tanggal',(res,req) => unitReq.handleUnitReqSummary(res,req))
    app.post('/api/admin/get-request-table',(res,req) => unitReq.handleUnitReqTable(res,req))
    app.post('/api/admin/add-quota',(res,req) => unitReq.handleUnitReqInsert(res,req))
}