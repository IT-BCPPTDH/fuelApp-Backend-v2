const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { postFormData,insertToForm, deleteForm, editForm } = require("../query-service/form_data/insert");
const { updateFromData } = require("../query-service/form_data/update");
const { getPrevious, getData, getPreviousMonth,getLastTransaction } = require("../query-service/form_data/getdata");
const db = require('../database/helper');
const { QUERY_STRING } = require("../helpers/queryEnumHelper");
const { base64ToImageSign, base64ToImageFlow } = require("../helpers/base64toImage");

async function operatorPostData(data) {
    try{
        let result = await postFormData(data)
        const newData = await db.query(QUERY_STRING.getTableFormData, [data.lkf_id])
        if(result){
            return {
                status: HTTP_STATUS.CREATED,
                message: 'Data Created',
                data: result,
                res: newData.rows
            };
        }else{
            return {
                status: HTTP_STATUS.FORBIDDEN,
                message: 'Data Not Created',
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

async function adminUpdateData(data) {
    try{
        let result = await editForm(data)
        if(result.status == true){
            const newData = await db.query(QUERY_STRING.getTableFormData, [data.lkf_id])
            return {
                status: HTTP_STATUS.OK,
                message: result.message,
                data: newData
            };
        }else{
            return {
                status: HTTP_STATUS.METHOD_NOT_ALLOWED,
                message: result.message,
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

async function getFormDataPrev(unit_no, tanggal) {
    try{
        let result = await getPrevious(unit_no, tanggal)
        if(result.length > 0 ){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
            };
        }else{
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
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

async function bulkInsert(bulkData){
    try{
        const dates = bulkData.map((itm) => itm.date_trx)
        const uniqueDates = [...new Set(dates)];
        const existingData = await getAllByDate(uniqueDates)
        const arrData = []
        for (let index = 0; index < bulkData.length; index++) {
            let sign = null
            let foto = null
            let element = bulkData[index];

            const isExisting = existingData.data.some(item => item.from_data_id === element.from_data_id);
            
            if(element.signature){
                sign = base64ToImageSign(element.signature)
            }
            if(element.photo){
                foto = base64ToImageFlow(element.photo)
            }

            element = {
                ...element,
                signature:sign,
                photo:foto
            }

            if (!isExisting) {
              await insertToForm(element);
              arrData.push(element)
            }
        }
    
        return {
          status: HTTP_STATUS.OK,
          message: "Succesfully insert data!",
          rowsLength: arrData.length
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

async function getAllByDate(data) {
    try{
        let result = await getData(data)
        if(result.length > 0 ){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
            };
        }else{
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
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

async function deleteData(data) {
    try{
        let result = await deleteForm(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data has been delete!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.FORBIDDEN,
                message: 'Cannot delete data',
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

async function getPrevMonths(data) {
    try{
        let result = await getPreviousMonth(data)
        if(result.length > 0 ){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
            };
        }else{
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
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

async function getLastTrx() {
    try{
        let result = await getLastTransaction()
        if(result.length > 0 ){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
            };
        }else{
            return {
                status: HTTP_STATUS.OK,
                message: 'Data',
                data:result
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
    operatorPostData,
    adminUpdateData,
    getFormDataPrev,
    bulkInsert,
    deleteData,
    getPrevMonths,
    getLastTrx
}