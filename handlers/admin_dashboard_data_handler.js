const { summaryFormData, tableFormData, getPrintLkf, uploadData } = require("../controllers/admin_detail_lkf_controller");
const {handleResponseParams,handleUploadFile, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDashboardFormData(res, req) {
    await handleResponseParams(res, req, summaryFormData, 1 )
}

async function handleDashboardTableData(res, req) {
    await handleResponseParams(res, req, tableFormData, 1 )
}

async function handlePrintData(res, req) {
    await handleResponseParams(res, req, getPrintLkf, 1 )
}

async function handleUploadData(res, req) {
    await await handleUploadFile(res, req,uploadData, true)
}

module.exports = {
    handleDashboardFormData,
    handleDashboardTableData,
    handlePrintData,
    handleUploadData
}