const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getPrevious = async (params) => {
    try {
        let data = await db.query(QUERY_STRING.getLastDataByStation,[params])
        return data.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

const getData = async (params) => {
    try {
        let data = await db.query(QUERY_STRING.getDataByDate,[params])
        return data.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    getPrevious,
    getData
}