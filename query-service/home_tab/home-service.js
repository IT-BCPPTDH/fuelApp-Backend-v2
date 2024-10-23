const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotal = async (params) => {
    try {
        const result = await db.query(QUERY_STRING.getHomeTotals, [params]);
        

        if (result.rows && result.rows.length > 0) {
            return result.rows;
        } else {
            console.warn('No rows found for the given parameters:', params);
            return []; 
        }
    } catch (error) {
        logger.error(error);
        console.error('Error during database query:', error);
        throw new Error('Database query failed'); 
    }
};


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