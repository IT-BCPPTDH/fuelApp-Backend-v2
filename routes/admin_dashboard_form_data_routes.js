const dashboardData = require('../handlers/admin_dashboard_data_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.get('/api/admin/get-dashboard-data/:id',(res,req) => dashboardData.handleDashboardFormData(res,req))
    app.get('/api/admin/get-dashboard-table-data/:id',(res,req) => dashboardData.handleDashboardTableData(res,req))
}