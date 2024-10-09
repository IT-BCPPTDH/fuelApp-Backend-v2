const quotaHandler = require('../handlers/quota_usage_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.get('/api/quota-usage/get-data/:tanggal',(req,res) => quotaHandler.handleGetData(req,res));
    app.get('/api/quota-usage/bulk-insert',(req,res) => quotaHandler.handleBulkData(req,res));
    app.get('/api/quota-usage/get-active/:tanggal',(req,res) => quotaHandler.handleActiveData(req,res));
    app.put('/api/quota-usage/update-data',(req,res) => quotaHandler.handleUpdateActive(req,res));
}
