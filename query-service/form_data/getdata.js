const db = require('../../database/helper');
const { formatYYYYMMDD,formatYYYYMMDDBefore } = require('../../helpers/dateHelper');
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

const getPreviousMonth = async (params) => {
    try {
        let date = formatYYYYMMDD(params)
        let dateBefore = formatYYYYMMDDBefore(date, 30)
        // console.log(dateBefore)
        let data = await db.query(QUERY_STRING.getLastDataMonth,[dateBefore, date])
        // console.log(data.rows)
        return data.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

const getLastTransaction = async () => {
    try {

        let data = await db.query(QUERY_STRING.getLasTrx)

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
    getPreviousMonth,
    getData,
    getLastTransaction
}