const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require('../helpers/enumHelper')
// const bulkData = require('../data-json/operator.json')
const { insertToOperator} = require('../query-service/quota_usage/quota_usage_service')
const cron = require('node-cron');

async function bulkInsertOperator(){
    try{
        for (let index = 0; index < bulkData.length; index++) {
            const element = bulkData[index];
            const inserted = await insertToOperator(element)
          }
        
          return {
            status: HTTP_STATUS.OK,
            message: "Succesfully insert data!"
          }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

/** This block code for update data based on date  */

// cron.schedule('0 0 * * *', async () => {
//   console.log("Loading for insert data at midnight...");

//   try {
//     const data = await bulkInsertOperator();
//     return {
//         status:HTTP_STATUS.OK,
//         message: "Successfully inserted data:", data
//     }; 
//   } catch (error) {
//     return {
//         status:HTTP_STATUS.BAD_REQUEST,
//         message: "Something wrong with this: ", error
//     }; 
//   }
// });

async function getAllData(data) {
    try{
        let result = await getTotal(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Data Succesfully Fetch!',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data not found!',
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

module.exports = {
    getAllData
}
