const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getDataLastLkf, getDataLastLkfAll } = require("../query-service/form_lkf/getData");
const { postFormLkf } = require("../query-service/form_lkf/insertData");
const { closeFormLkf } = require("../query-service/form_lkf/updateData");
const { getEquipment, getUnitLvProto } = require("../helpers/proto/master-data");


async function operatorPostLkf(data) {
    try{
        let result = await postFormLkf(data)
        if(result){
            return {
                status: HTTP_STATUS.CREATED,
                message: 'Data Created',
                data: result
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

async function operatorCloseLkf(data) {
    try{
        let result = await closeFormLkf(data)
        if(result){
            return {
                status: HTTP_STATUS.CREATED,
                message: 'Data Updated',
            };
        }else{
            return {
                status: HTTP_STATUS.FORBIDDEN,
                message: 'Data Not Updated',
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

async function getLastLkf(station) {
    
    try{
        let result = await getDataLastLkf(station)
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
                data:{
                    closing_dip:0,
                    closing_sonding:0,
                    flow_meter_end:0,
                    hm_end:0
                }
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

async function getLastLkfAll() {
    
    try{
        let result = await getDataLastLkfAll()
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
                data:{
                    closing_dip:0,
                    closing_sonding:0,
                    flow_meter_end:0,
                    hm_end:0
                }
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

module.exports ={
    operatorPostLkf,
    operatorCloseLkf,
    getLastLkf,
    getLastLkfAll,
}