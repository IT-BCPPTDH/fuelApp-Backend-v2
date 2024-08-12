const formDataHandler = require('../handlers/form_data_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.post('/api/operator/post-data',(res,req) => formDataHandler.handleOperatorPostData(res,req))
    // app.get('/api/operator/get-dashboard',(res,req) => formDataHandler.handleOperatorPostData(res,req))

    // admin
    app.put('/api/admin/update-data',(res,req) => formDataHandler.handleAdminUpdateData(res,req))
}