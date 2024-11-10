const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotal = async (params) => {
    try {
        const result = await db.query(QUERY_STRING.getTotals, [params]);
        

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


const getHomeTab = async (params) => {
    try {
        // Assuming `params.lkf_id` is the parameter to be used in the query
        const result = await db.query(QUERY_STRING.getHomeTotals, [params]); // Correctly passing parameter

       
        if (result.rows && result.rows.length > 0) {
            return result.rows; // Return rows if found
        } else {
            console.warn('No rows found for the given parameters:', params);
            return []; // Return empty array if no data
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
    getTables,
    getHomeTab,

}