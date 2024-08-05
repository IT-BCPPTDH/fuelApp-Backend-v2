const logger = require("../helpers/pinoLog");
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getDataLogin, logoutUser} = require("../query-service/login/post-login");

async function loginPost(data) {
    try{
        let result = await getDataLogin(data)
        if(result.success){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Created',
                data: result.data
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: result.message,
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

async function logoutTab(data) {
    try{
        let result = await logoutUser(data)
        if(result.success){
            return {
                status: HTTP_STATUS.OK,
                message: 'Logout success'
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: result.message,
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
    loginPost,
    logoutTab
}