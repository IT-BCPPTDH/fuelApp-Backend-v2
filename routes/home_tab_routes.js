const home = require('../handlers/home_tab_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.get('/api/operator/get-home-summary/:lkf_id',(res,req) => home.handleHomeSummary(res,req))
    app.get('/api/operator/get-home-table/:lkf_id',(res,req) => home.handleHomeTable(res,req))
}