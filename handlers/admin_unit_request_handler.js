const { summaryUnitReq, addUnitReq, listUnitReq } = require("../controllers/admin_unit_request_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleUnitReqSummary(res, req) {
    await handleResponseParams(res, req, summaryUnitReq, 1 )
}

async function handleUnitReqTable(res, req) {
    await handleResponseJsonOperator(res, req, listUnitReq, true )
}

async function handleUnitReqInsert(res, req) {
    await handleResponseJsonOperator(res, req, addUnitReq, true )
}

module.exports = {
    handleUnitReqSummary,
    handleUnitReqTable,
    handleUnitReqInsert
}