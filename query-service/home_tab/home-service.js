const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotal = async(params) => {
    try {
        const result = await db.query(QUERY_STRING.getHomeTotals, [params])
        return result.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getTables = async(params) => {
    try {
        const result = await db.query(QUERY_STRING.getHomeTable, [params])
        return result.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

module.exports = {
    getTotal,
    getTables
}