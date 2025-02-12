const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require('../helpers/enumHelper')
// const bulkData = require('../data-json/operator.json')
const { insertToOperator, getTotal, updateActive, updateModel, updateTab, insertOne} = require('../query-service/quota_usage/quota_usage_service')
const logger = require("../helpers/pinoLog");
const { QUERY_STRING } = require('../helpers/queryEnumHelper');
const { getUnitLvProto } = require('../helpers/proto/master-data');
const { formatYYYYMMDD } = require('../helpers/dateHelper');
const unitKuota = require('../data-json/unit_quota.json')


async function bulkInsertQuotaDaily(bodyParams){
    try{
        const getUnit = await getUnitLvProto()
        const unit = JSON.parse(getUnit.data)
        const date = formatYYYYMMDD(bodyParams.tanggal)
        const data = {
            tanggal : date,
            option: 'Daily'
        }
        const checkData = await getTotal(data)
        if(checkData.length !== 0){
            return {
                status: HTTP_STATUS.OK,
                message: "Succesfully fetch data!",
                data:checkData
            }
        }
        for (const element of unitKuota) {
            await insertToOperator(element, date);
        }
        
        return {
          status: HTTP_STATUS.OK,
          message: "Succesfully insert data!"
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

/** This block code for update data based on date  */
const generateDaily = async() => {
      console.log("Loading for insert data at midnight..."); 
    
      try {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
        const data = await bulkInsertQuotaDaily({tanggal: today});
        console.log("Done insert data!");
        return {
            status:HTTP_STATUS.OK,
            message: "Successfully inserted data:", data
        }; pr
      } catch (err) {
        logger.error(err)
        return {
            status:HTTP_STATUS.BAD_REQUEST,
            message: "Something wrong with this: ", err
        }; 
      }
    // });
}

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
        // console.log(result.rows)
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

async function getStatuBus(params) {
    try{
        const date = formatYYYYMMDD(params)
        const kategori = 'GENERAL SUPPORT'
        const model = '%BUS ELF%'
        let result = await db.query(QUERY_STRING.getMaxQuota, [date, kategori, model])
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

async function getStatusHLV(params) {
    try{
        const date = formatYYYYMMDD(params)
        const kategori = 'BUS'
        const model = '%COLT%'
        let result = await db.query(QUERY_STRING.getMaxQuota, [date, kategori, model])
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

async function getStatusLV(params) {
    try{
        const date = formatYYYYMMDD(params)
        const kategori = 'LIGHT VEHICLE'
        const model = '%TRITON%'
        let result = await db.query(QUERY_STRING.getMaxQuota, [date, kategori,model])
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

async function editModel(bodyParams) {
    try{
        let result = await updateModel(bodyParams)
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
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function updateFromTab(bodyParams) {
    try{
        let result = await updateTab(bodyParams)
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
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
          };
    }
}

async function insertData(Json) {
    try{
        const date = formatYYYYMMDD(Json.date)
        // const data = {
        //     tanggal : date,
        //     option: 'Daily'
        // }
        const checkData = await db.query(QUERY_STRING.getQuotaByUnit, [date, Json.unit_no])
        console.log(date)
        console.log(checkData.rows)
        if(checkData.rows.length !== 0){
            return {
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Data has been inserted!"
            }
        }
        let result = await insertOne(Json)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data succesfully created!',
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

module.exports = {
    getAllData,
    bulkInsertQuotaDaily,
    updateData,
    getActiveData,
    editModel,
    getStatuBus,
    getStatusHLV,
    getStatusLV,
    updateFromTab,
    generateDaily,
    insertData
}
