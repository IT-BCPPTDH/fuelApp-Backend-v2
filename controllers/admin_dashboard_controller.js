const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTotalDashboard, getTableDashboard } = require("../query-service/admin_dashboard/admin_dashboard_services");

async function fuelSummary (tanggal){
    try{
        let result = await getTotalDashboard(tanggal)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data Not Found',
            };
        }
    }catch(err){
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
        };
    }
}

async function stationSummary(tanggal){
    try{
        let result = await getTableDashboard(tanggal)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data Not Found',
            };
        }
    }catch(err){
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
        };
    }
}

module.exports = {
    fuelSummary,
    stationSummary
}