const quotaHandler = require('../handlers/quota_usage_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    // operator
    app.get('/api/quota-usage/get-data/:tanggal',(req,res) => quotaHandler.handleGetData(req,res));
}
