const dashboardStation = require('../handlers/admin_dashboard_stasion_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.post('/api/admin/get-dashboard-station',(res,req) => dashboardStation.handleDashboardStation(res,req))
    app.post('/api/admin/get-dashboard-table-station',(res,req) => dashboardStation.handleDashboardTableStation(res,req))
    app.put('/api/admin/update-station',(res,req) => dashboardStation.handleUpdateLkf(res,req))
    app.put('/api/admin/delete-station/:lkf_id',(res,req) => dashboardStation.handleDelLkf(res,req))
    app.post('/api/admin/add-station',(res,req) => dashboardStation.handleAddLkf(res,req))
}