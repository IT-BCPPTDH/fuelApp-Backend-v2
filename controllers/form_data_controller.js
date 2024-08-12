const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { postFormData } = require("../query-service/form_data/insert");
const { updateFromData } = require("../query-service/form_data/update");

async function operatorPostData(data) {
    try{
        let result = await postFormData(data)
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

async function adminUpdateData(data) {
    try{
        
        let result = await updateFromData(data)
        return {
            status: HTTP_STATUS.CREATED,
            message: 'Data Created',
            // data: result
        };
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
    adminUpdateData
}