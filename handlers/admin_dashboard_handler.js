const { fuelSummary, stationSummary } = require("../controllers/admin_dashboard_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDashboardData(res, req) {
    await handleResponseJsonOperator(res, req, fuelSummary, true )
}

async function handleDashboardTable(res, req) {
    await handleResponseJsonOperator(res, req, stationSummary, true )
}

module.exports = {
    handleDashboardData,
    handleDashboardTable
}