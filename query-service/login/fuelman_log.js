const db = require('../../database/helper');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const logger = require('../../helpers/pinoLog');


const insertLog = async(data) => {
    try {
        let { lkf_id, date, jde_operator, name_operator, station, login_time } = data
        const params = [lkf_id, date, jde_operator, name_operator, station, login_time]
        let result = await db.query(QUERY_STRING.insert_log, params)
        if(result.rowCount>0){
            return result.rows[0];
        }else{
            return false
        }
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const updateLog = async(data) => {
    try {
        let { logout_time, lkf_id, date } = data
        const params = [logout_time, lkf_id, date]
        let result = await db.query(QUERY_STRING.update_log, params)
        if(result.rowCount>0){
            return result.rows[0];
        }else{
            return false
        }
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

module.exports = {
    insertLog,
    updateLog
}