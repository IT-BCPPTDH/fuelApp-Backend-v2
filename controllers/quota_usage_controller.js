const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require('../helpers/enumHelper')
// const bulkData = require('../data-json/operator.json')
const { formatYYYYMMDD, formatDateToDDMMYYYY } = require('../helpers/dateHelper');
const { insertToOperator, getTotal, updateActive} = require('../query-service/quota_usage/quota_usage_service')
const cron = require('node-cron');
const { fetchUnitLV } = require('../helpers/httpHelper')
const logger = require("../helpers/pinoLog");
const { QUERY_STRING } = require('../helpers/queryEnumHelper');

async function bulkInsertQuotaDaily(){
    try{
        const today = new Date().toISOString().split('T')[0];
        const unit = await fetchUnitLV()
        const checkData = await getTotal(today)
        if(checkData.length !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: "Succesfully fetch data!",
                data:checkData
            }
        }else{
            for (let index = 0; index < unit.data.length; index++) {
                const element = unit.data[index];
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
        const data = formatYYYYMMDD(Json)
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

module.exports = {
    getAllData,
    bulkInsertQuotaDaily,
    updateData,
    getActiveData
}
