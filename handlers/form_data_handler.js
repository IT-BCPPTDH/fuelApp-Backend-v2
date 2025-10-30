const { operatorPostData, adminUpdateData, getFormDataPrev, bulkInsert, deleteData, getPrevMonths, getLastTrx} = require("../controllers/form_data_controller");
const { handleResponseJsonOperator, handleResponseParams, handleResponseJsonAdmin } = require("./httpResponseHandler");

async function handleOperatorPostData(res, req) {
    await handleResponseJsonOperator(res, req, operatorPostData, true )
}

async function handleOperatorByUnit(res, req) {
    await handleResponseParams(res, req, getFormDataPrev, 2 )
}

async function handleAdminUpdateData(res, req) {
    await handleResponseJsonOperator(res, res, adminUpdateData, true)
} 

//async function handleOperatorBulkData(res, req) {
    //console.log("Bulk data received:", res.body);
  //  await handleResponseJsonOperator(res, req, bulkInsert, true )
//}

async function handleOperatorBulkData(res, req) {
    console.log("✅ handleOperatorBulkData called!");
    const bulkData = req.body;
    console.log("📥 Bulk data received:", bulkData);
    await handleResponseJsonOperator(res, req, bulkInsert, true);
}


async function handleDeleteData(res, req) {
    await handleResponseParams(res, req, deleteData, 1 )
}

async function handleUnitPrevMonth(res, req) {
    await handleResponseParams(res, req, getPrevMonths, 1 )
}

async function handleLastTrx(res, req) {
    await handleResponseParams(res, req, getLastTrx, 1 )
}

module.exports = {
    handleOperatorPostData,
    handleAdminUpdateData,
    handleOperatorByUnit,
    handleOperatorBulkData,
    handleDeleteData,
    handleUnitPrevMonth,
    handleLastTrx
}
