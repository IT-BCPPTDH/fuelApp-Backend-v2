const { getSummaryData, getTable,getSummaryTab} = require("../controllers/home_controller");

const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleHomeSummary(res, req) {
    await handleResponseParams(res, req, getSummaryData, 1 )
}

async function handleHomeTable(res, req) {
    await handleResponseParams(res, req, getTable, 1 )
}
async function handleHomeTab(res, req) {
    await handleResponseParams(res, req, getSummaryTab,1)
    
}


module.exports = {
    handleHomeSummary,
    handleHomeTable,
    handleHomeTab
}