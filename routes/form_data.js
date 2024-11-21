const formDataHandler = require('../handlers/form_data_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.post('/api/operator/post-data',(res,req) => formDataHandler.handleOperatorPostData(res,req))
    app.get('/api/operator/get-data/:unitNo/:tanggal',(res,req) => formDataHandler.handleOperatorByUnit(res,req))
    app.post('/api/operator/bulk-insert',(res,req) => formDataHandler.handleOperatorBulkData(res,req))
    app.get('/api/operator/get-data-prev/:tanggal',(res,req) => formDataHandler.handleUnitPrevMonth(res,req))

    // admin
    app.put('/api/admin/update-data',(res,req) => formDataHandler.handleAdminUpdateData(res,req))
    app.put('/api/admin/delete-data/:id',(res,req) => formDataHandler.handleDeleteData(res,req))
}