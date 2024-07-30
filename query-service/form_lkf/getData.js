const db = require('../../database/helper');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getDataLastLkf = async (params) => {
    try {
        let data = await db.query(QUERY_STRING.getLastLKF,[params])
        return data.rows
        // return true;
    } catch (error) {
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    getDataLastLkf
}