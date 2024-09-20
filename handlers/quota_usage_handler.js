const { getAllData } = require("../controllers/quota_usage_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleGetData(res, req) {
    await handleResponseParams(res, req, getAllData, 1 )
}

module.exports = {
    handleGetData
}