const dashboard = require('../handlers/admin_dashboard_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.post('/api/admin/get-dashboard',(res,req) => dashboard.handleDashboardData(res,req))
    app.post('/api/admin/get-dashboard-table',(res,req) => dashboard.handleDashboardTable(res,req))
}