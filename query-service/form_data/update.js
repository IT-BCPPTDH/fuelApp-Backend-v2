const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const updateFromData = async (data) =>{
    console.log(data)
    try{
        const dt = new Date()
        
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

module.exports = {
    updateFromData
}