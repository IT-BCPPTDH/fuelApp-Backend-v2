const { operatorPostLkf, getLastLkf, operatorCloseLkf, getLastLkfAll } = require("../controllers/form_lkf_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleOperatorPostLkf(res, req) {
    await handleResponseJsonOperator(res, req, operatorPostLkf, true )
}

async function handleOperatorCloseLkf(res, req) {
    await handleResponseJsonOperator(res, req, operatorCloseLkf, true )
}

async function handleGetDataLastLkf(res, req) {
    await handleResponseParams(res, req, getLastLkf, 1 )
}

async function handleGetDataLastLkfAll(res, req) {
    await handleResponseParams(res, req, getLastLkfAll, 1 )
}

module.exports = {
    handleOperatorCloseLkf,
    handleOperatorPostLkf,
    handleGetDataLastLkf,
    handleGetDataLastLkfAll,
}