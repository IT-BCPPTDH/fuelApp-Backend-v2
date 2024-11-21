const { summaryStation, stationTable, deleteStation, editStation} = require("../controllers/admin_dashboard_station_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDashboardStation(res, req) {
    await handleResponseJsonOperator(res, req, summaryStation, true )
}

async function handleDashboardTableStation(res, req) {
    await handleResponseJsonOperator(res, req, stationTable, true )
}

async function handleUpdateLkf(res, req) {
    await handleResponseJsonOperator(res, req, editStation, true )
}

async function handleDelLkf(res, req) {
    await handleResponseParams(res, req, deleteStation, 1 )
}

module.exports = {
    handleDashboardStation,
    handleDashboardTableStation,
    handleUpdateLkf,
    handleDelLkf
}