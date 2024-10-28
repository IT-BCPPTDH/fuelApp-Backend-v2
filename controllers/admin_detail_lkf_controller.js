const logger = require("../helpers/pinoLog");
const db = require('../database/helper');
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTotalData,getTableData } = require("../query-service/admin_detail_form_data/form_data_admin_services");
const { QUERY_STRING } = require('../helpers/queryEnumHelper');

async function summaryFormData (data){
    try{
        let result = await getTotalData(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data Not Found',
            };
        }
    }catch(err){
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
        };
    }
}

async function tableFormData(data){
    try{
        let result = await getTableData(data)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: result
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data Not Found',
            };
        }
    }catch(err){
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
        };
    }
}

async function getPrintLkf(data){
    try{
        const res = await db.query(QUERY_STRING.getHeaderLkf, [data])
        const result = res.rows
        const jmlIssued = result[0].total_issued + result[0].total_transfer
        const jmlStock = result[0].opening_dip  + result[0].total_receive + result[0].total_receive_kpc 
        const jmlBalance = jmlStock - jmlIssued
        const totalIssued = result[0].total_issued + result[0].total_transfer
        const totalMeters = result[0].flow_meter_end - result[0].flow_meter_start
        const daily = result[0].total_close - jmlBalance
        const datas = { 
            date: result[0].formatted_date,
            fuelman_id: result[0].fuelman_id,
            shift: result[0].shift,
            station: result[0].station,
            hm_start: result[0].hm_start,
            hm_end: result[0].hm_end,
            openCm: result[0].opening_sonding ? result[0].opening_sonding : 0,
            openStock : result[0].opening_dip ? result[0].opening_dip : 0,
            receipt: result[0].total_receive ? result[0].total_receive : 0,
            receipt_kpc: result[0].total_receive_kpc ? result[0].total_receive_kpc : 0,
            stock: jmlStock ? jmlStock : 0,
            issued: totalIssued ? totalIssued : 0,
            totalIssued: jmlIssued ? jmlIssued : 0,
            totalBalance: jmlBalance ? jmlBalance : 0,
            closingCm: result[0].closing_sonding ? result[0].closing_sonding : 0,
            closingStock : result[0].total_close ? result[0].total_close : 0,
            dailyVarience: daily ? daily : 0, 
            startMeter: result[0].flow_meter_start ? result[0].flow_meter_start: 0,
            closeMeter: result[0].flow_meter_end ? result[0].flow_meter_end : 0,
            totalMeter: totalMeters ? totalMeters : 0
        }
        const tabel = await tableFormData(data)
        if(res.rowCount > 0){
            return {
                status: HTTP_STATUS.OK,
                message: 'Successfuly get data.',
                data: {
                    header : datas, table: tabel.data
                }
            };
        }else{
            return {
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Data Not Found',
            };
        }
    }catch(err){
        logger.error(err)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${err}`,
        };
    }
}

async function uploadData(data){
    try{
        console.log("sini")
        console.log(data)
        const { base64File } = data;

        const buffer = Buffer.from(base64File, 'base64');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer); 

        // Mengambil sheet pertama
        const worksheet = workbook.worksheets[0];

        const data = [];
        worksheet.eachRow((row, rowNumber) => {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[`Column${colNumber}`] = cell.value; 
          });
          data.push(rowData);
        });

        // Proses data sesuai kebutuhan (misalnya menyimpannya ke database)
        console.log(data)
        res.json(data);
    
        return {
          status: HTTP_STATUS.OK,
          message: "Succesfully insert data!",
        //   rowsLength: arrData.length
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

async function bulkInsert(bulkData){
    try{
        const dates = bulkData.map((itm) => itm.date_trx)
        const uniqueDates = [...new Set(dates)];
        const existingData = await getAllByDate(uniqueDates)
        const arrData = []
        for (let index = 0; index < bulkData.length; index++) {
            const element = bulkData[index];
            const isExisting = existingData.data.some(item => item.from_data_id === element.from_data_id);

            if (!isExisting) {
              await insertToForm(element);
              arrData.push(element)
            }
        }
    
        return {
          status: HTTP_STATUS.OK,
          message: "Succesfully insert data!",
          rowsLength: arrData.length
        }
    }catch(error){
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${STATUS_MESSAGE.ERR_GET} ${error}`,
          };
    }
}

module.exports = {
    summaryFormData,
    tableFormData,
    getPrintLkf,
    uploadData
}