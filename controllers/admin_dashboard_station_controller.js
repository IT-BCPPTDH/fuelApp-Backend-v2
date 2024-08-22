const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTotalStation,getTableStation } = require("../query-service/admin_dashboard_station/get-data-service");

async function summaryStation (data){
    try{
        let result = await getTotalStation(data)
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

async function stationTable(data){
    try{
        let result = await getTableStation(data)
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
    summaryStation,
    stationTable
}