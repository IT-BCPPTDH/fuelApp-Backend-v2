const { summaryStation, stationTable } = require("../controllers/admin_dashboard_station_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDashboardStation(res, req) {
    await handleResponseJsonOperator(res, req, summaryStation, true )
}

async function handleDashboardTableStation(res, req) {
    await handleResponseJsonOperator(res, req, stationTable, true )
}

module.exports = {
    handleDashboardStation,
    handleDashboardTableStation
}