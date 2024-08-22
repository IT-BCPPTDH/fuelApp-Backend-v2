const dashboardStation = require('../handlers/admin_dashboard_stasion_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.post('/api/admin/get-dashboard-station',(res,req) => dashboardStation.handleDashboardStation(res,req))
    app.post('/api/admin/get-dashboard-table-station',(res,req) => dashboardStation.handleDashboardTableStation(res,req))
}