const { summaryFormData, tableFormData } = require("../controllers/admin_detail_lkf_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDashboardFormData(res, req) {
    await handleResponseParams(res, req, summaryFormData, 1 )
}

async function handleDashboardTableData(res, req) {
    await handleResponseParams(res, req, tableFormData, 1 )
}

module.exports = {
    handleDashboardFormData,
    handleDashboardTableData
}