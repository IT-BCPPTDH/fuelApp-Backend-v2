const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require('../helpers/enumHelper')
// const bulkData = require('../data-json/operator.json')
const { insertToOperator, getTotal, updateActive} = require('../query-service/quota_usage/quota_usage_service')
const cron = require('node-cron');
const logger = require("../helpers/pinoLog");
const { QUERY_STRING } = require('../helpers/queryEnumHelper');
const { getUnitLvProto } = require('../helpers/proto/master-data')

async function bulkInsertQuotaDaily(){
    try{
        const today = new Date().toISOString().split('T')[0];
        const getUnit = await getUnitLvProto()
        const unit = JSON.parse(getUnit.data)
        const data = {
            tanggal : today,
            option: 'Daily'
        }
        const checkData = await getTotal(data)
        if(checkData.length !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: "Succesfully fetch data!",
                data:checkData
            }
        }else{
            for (let index = 0; index < unit.length; index++) {
                const element = unit[index];
                const inserted = await insertToOperator(element)
            }
            
            return {
              status: HTTP_STATUS.OK,
              message: "Succesfully insert data!"
            }
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

/** This block code for update data based on date  */

cron.schedule('0 6 * * *', async () => {
    // cron.schedule('*/30 * * * * *', async () => {
  console.log("Loading for insert data at midnight...");

  try {
    const data = await bulkInsertQuotaDaily();
    console.log("Done insert data!");
    return {
        status:HTTP_STATUS.OK,
        message: "Successfully inserted data:", data
    }; 
  } catch (error) {
    logger.error(err)
    return {
        status:HTTP_STATUS.BAD_REQUEST,
        message: "Something wrong with this: ", error
    }; 
  }
});

async function getAllData(Json) {
    try{
        let result = await getTotal(Json)
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

async function updateData(Json) {
    try{
        let result = await updateActive(Json)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Update data!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        console.log(err)
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function getActiveData(params) {
    try{
        let result = await db.query(QUERY_STRING.getActiveQuota, [params])
        if(result.rows !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Update data!',
                data: result.rows
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        console.log(err)
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function disableBus(params) {
    try{
        let result = await db.query(QUERY_STRING.inActiveBus, [params])
        if(result.rows !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Update data!',
                data: result.rows
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        console.log(err)
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function disableLV(params) {
    try{
        let result = await db.query(QUERY_STRING.inActiveLV, [params])
        if(result.rows !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Update data!',
                data: result.rows
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        console.log(err)
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function disableHLV(params) {
    try{
        let result = await db.query(QUERY_STRING.inActiveHLV, [params])
        if(result.rows !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Update data!',
                data: result.rows
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
            };
        }
    } catch(err) {
        console.log(err)
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

module.exports = {
    getAllData,
    bulkInsertQuotaDaily,
    updateData,
    getActiveData,
    disableBus,
    disableLV,
    disableHLV
}
