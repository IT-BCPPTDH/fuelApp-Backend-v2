const { operatorPostData, adminUpdateData } = require("../controllers/form_data_controller");
const { handleResponseJsonOperator, handleResponseParams, handleResponseJsonAdmin } = require("./httpResponseHandler");

async function handleOperatorPostData(res, req) {
    await handleResponseJsonOperator(res, req, operatorPostData, true )
}

async function handleAdminUpdateData(res, req) {
    await handleResponseJsonAdmin(res, res, adminUpdateData, true)
} 

module.exports = {
    handleOperatorPostData,
    handleAdminUpdateData
}