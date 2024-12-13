const quotaHandler = require('../handlers/quota_usage_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.post('/api/quota-usage/get-data',(req,res) => quotaHandler.handleGetData(req,res));
    app.post('/api/quota-usage/bulk-insert',(req,res) => quotaHandler.handleBulkData(req,res));
    app.get('/api/quota-usage/get-active/:tanggal',(req,res) => quotaHandler.handleActiveData(req,res));
    app.get('/api/quota-usage/get-status-bus/:tanggal',(req,res) => quotaHandler.handleActivatedBus(req,res));
    app.get('/api/quota-usage/get-status-lv/:tanggal',(req,res) => quotaHandler.handleActivatedLv(req,res));
    app.get('/api/quota-usage/get-status-hlv/:tanggal',(req,res) => quotaHandler.handleActivatedHlv(req,res));
    app.put('/api/quota-usage/update-data',(req,res) => quotaHandler.handleUpdateActive(req,res));
    app.put('/api/quota-usage/edit-model',(req,res) => quotaHandler.handleEditModel(req,res));
    app.put('/api/quota-usage/update-from-tab',(req,res) => quotaHandler.handleUPdateFromTab(req,res));
}
