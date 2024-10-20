const { downloadReportLkf, downloadHomeStation, downloadLkfDetailedLkf, downloadLkfElipse, DailyConsumtion } = require("../controllers/admin_download_controller");
const {handleResponseParams, handleResponseJsonAdmin, handleResponseJsonOperator} = require("./httpResponseHandler");

async function handleDownload(res, req) {
    await handleResponseJsonOperator(res, req, downloadReportLkf, true )
}

async function handleDownloadStation(res, req) {
    await handleResponseJsonOperator(res, req, downloadHomeStation , true )
}

async function handleDownloadLkf(res, req) {
    await handleResponseJsonOperator(res, req, downloadLkfDetailedLkf , true )
}

async function handleDownloadElipseLkf(res, req) {
    await handleResponseJsonOperator(res, req, downloadLkfElipse , true )
}

async function handleDownloadDaily(res, req) {
    await handleResponseJsonOperator(res, req, DailyConsumtion , true )
}

module.exports = {
    handleDownload,
    handleDownloadStation,
    handleDownloadLkf,
    handleDownloadElipseLkf,
    handleDownloadDaily
}