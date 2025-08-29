const logger = require("../helpers/pinoLog");
const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTotalData,getTableData, insertBulkData } = require("../query-service/admin_detail_form_data/form_data_admin_services");
const { QUERY_STRING } = require('../helpers/queryEnumHelper');

async function summaryFormData (data){
    try{
        let result = await getTotalData(data)
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

async function tableFormData(data){
    try{
        let result = await getTableData(data)
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

async function getPrintLkf(data){
    try{
        const res = await db.query(QUERY_STRING.getHeaderLkf, [data])
        const result = res.rows
        const jmlIssued = result[0].total_issued + result[0].total_transfer
        const jmlStock = result[0].opening_dip  + result[0].total_receive + result[0].total_receive_kpc 
        const jmlBalance = jmlStock - jmlIssued
        const totalIssued = result[0].total_issued + result[0].total_transfer
        const totalMeters = result[0].flow_meter_end - result[0].flow_meter_start
        const daily = result[0].total_close - jmlBalance
        const datas = { 
            date: result[0].formatted_date,
            fuelman_id: result[0].fuelman_id,
            shift: result[0].shift,
            station: result[0].station,
            hm_start: result[0].hm_start,
            hm_end: result[0].hm_end,
            openCm: result[0].opening_sonding ? result[0].opening_sonding : 0,
            openStock : result[0].opening_dip ? result[0].opening_dip : 0,
            receipt: result[0].total_receive ? result[0].total_receive : 0,
            receipt_kpc: result[0].total_receive_kpc ? result[0].total_receive_kpc : 0,
            stock: jmlStock ? jmlStock : 0,
            issued: totalIssued ? totalIssued : 0,
            totalIssued: jmlIssued ? jmlIssued : 0,
            totalBalance: jmlBalance ? jmlBalance : 0,
            closingCm: result[0].closing_sonding ? result[0].closing_sonding : 0,
            closingStock : result[0].total_close ? result[0].total_close : 0,
            dailyVarience: daily ? daily : 0, 
            startMeter: result[0].flow_meter_start ? result[0].flow_meter_start: 0,
            closeMeter: result[0].flow_meter_end ? result[0].flow_meter_end : 0,
            totalMeter: totalMeters ? totalMeters : 0
        }
        const tabel = await tableFormData(data)
        if(res.rowCount > 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: {
                    header : datas, table: tabel.data
                }
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

async function uploadData(headerArray, jsonArray, data){
    try{
        const users = JSON.parse(data)
        const result = await insertBulkData(headerArray, jsonArray, users)
        return {
          status: HTTP_STATUS.OK,
          message: "Succesfully insert data!",
          data: result
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

module.exports = {
    summaryFormData,
    tableFormData,
    getPrintLkf,
    uploadData
}
