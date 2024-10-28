const { getAllData, bulkInsertQuotaDaily, updateData, getActiveData, disableBus, disableHLV, disableLV } = require("../controllers/quota_usage_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleGetData(res, req) {
    await handleResponseJsonOperator(res, req, getAllData, 0 )
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

async function handleDisableBus(res, req) {
    await handleResponseJsonOperator(res, req, disableBus, true)
}

async function handleDisableLV(res, req) {
    await handleResponseJsonOperator(res, req, disableLV, true)
}

async function handleDisableHLV(res, req) {
    await handleResponseJsonOperator(res, req, disableHLV , true)
}

module.exports = {
    handleGetData,
    handleBulkData,
    handleUpdateActive,
    handleActiveData,
    handleDisableBus,
    handleDisableLV,
    handleDisableHLV
}