const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const {getTotal,  getTables, getHomeTab} = require("../query-service/home_tab/home-service")

async function getSummaryData(data) {
    try{
        let result = await getTotal(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Fetch!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}


async function getSummaryTab(data) {
    try{
        let result = await getHomeTab(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Fetch!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function getTable(data) {
    try{
        let result = await getTables(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Fetch!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

module.exports = {
    getSummaryData,
    getTable,
    getSummaryTab
}