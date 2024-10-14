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
    await handleResponseParams(res, req, disableBus, 1)
}

async function handleDisableLV(res, req) {
    await handleResponseParams(res, req, disableHLV, 1)
}

async function handleDisableHLV(res, req) {
    await handleResponseParams(res, req, disableLV, 1)
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