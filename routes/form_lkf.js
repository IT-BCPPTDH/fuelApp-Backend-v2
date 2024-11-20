const formLkfHandler = require('../handlers/form_lkf_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.get('/api/operator/last-lkf/:station',(res,req) => formLkfHandler.handleGetDataLastLkf(res,req))
    app.post('/api/operator/post-lkf',(res,req) => formLkfHandler.handleOperatorPostLkf(res,req))
    app.put('/api/operator/close-lkf',(res,req) => formLkfHandler.handleOperatorCloseLkf(res,req))
    app.get('/api/operator/last-lkf-all',(res,req) => formLkfHandler.handleGetDataLastLkfAll(res,req))
}