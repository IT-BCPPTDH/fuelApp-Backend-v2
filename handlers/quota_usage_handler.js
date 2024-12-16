const { getAllData, bulkInsertQuotaDaily, updateData, getActiveData, 
     getStatuBus, getStatusLV, getStatusHLV, editModel, 
     updateFromTab} = require("../controllers/quota_usage_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleGetData(res, req) {
    await handleResponseJsonOperator(res, req, getAllData, 0 )
}

async function handleBulkData(res, req) {
    await handleResponseJsonOperator(res, req, bulkInsertQuotaDaily, true )
}

async function handleUpdateActive(res, req) {
    await handleResponseJsonOperator(res, req, updateData, 0 )
}

async function handleActiveData(res, req) {
    await handleResponseParams(res, req, getActiveData, 1)
}

async function handleEditModel(res, req) {
    await handleResponseJsonOperator(res, req, editModel, true)
}

async function handleActivatedBus(res, req) {
    await handleResponseParams(res, req, getStatuBus, 1)
}

async function handleActivatedHlv(res, req) {
    await handleResponseParams(res, req, getStatusHLV, 1)
}

async function handleActivatedLv(res, req) {
    await handleResponseParams(res, req, getStatusLV, 1)
}

async function handleUPdateFromTab(res, req) {
    await handleResponseJsonOperator(res, req, updateFromTab, true)
}
// 
module.exports = {
    handleGetData,
    handleBulkData,
    handleUpdateActive,
    handleActiveData,
    handleEditModel,
    handleActivatedBus,
    handleActivatedHlv,
    handleActivatedLv,
    handleUPdateFromTab
}