const { getAllData, bulkInsertQuotaDaily, updateData, getActiveData } = require("../controllers/quota_usage_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleGetData(res, req) {
    await handleResponseParams(res, req, getAllData, 1 )
}

async function handleBulkData(res, req) {
    await handleResponseParams(res, req, bulkInsertQuotaDaily, 0 )
}

async function handleUpdateActive(res, req) {
    await handleResponseJsonOperator(res, req, updateData, 0 )
}

async function handleActiveData(res, req) {
    await handleResponseParams(res, req, getActiveData, 1)
}

module.exports = {
    handleGetData,
    handleBulkData,
    handleUpdateActive,
    handleActiveData
}