const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getDataLastLkf = async (params) => {
    console.log()
    try {
        let data = await db.query(QUERY_STRING.getLastLKF,[params])
        return data.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    getDataLastLkf
}