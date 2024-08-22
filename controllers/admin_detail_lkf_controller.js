const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTotalData,getTableData } = require("../query-service/admin_detail_form_data/form_data_admin_services");

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

module.exports = {
    summaryFormData,
    tableFormData
}