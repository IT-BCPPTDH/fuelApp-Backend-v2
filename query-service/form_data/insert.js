const db = require('../../database/helper');
const { base64ToImageFlow, base64ToImageSign } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { formatYYYYMMDD, formatInputYYYYMMDD } = require('../../helpers/dateHelper');

// const postFormData = async (data) => {
//     try {
//         const dt = new Date()
        
//         const { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by } = data

//         // let sign = await base64ToImage(signature)
//         // let pic = await base64ToImage(photo)

//         const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by ]
        
//         let result = await db.query(QUERY_STRING.postFormData, params)

//         if(data.no_unit.includes('LV') || data.no_unit.includes('HLV')){
//             const query = `UPDATE quota_usage SET used = $1 WHERE "unitNo" = $2`;

//             const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.no_unit])
//             if(existingData.rows.length > 0){
//                 qty += existingData.rows[0].used
//             }
//             const value = [qty, no_unit]
//             const res = await db.query(query, value);
//         }
        
//         if(result.rowCount>0){
//             return true
//         }else{
//             return false
//         }
//     } catch (error) {
//         logger.error(error)
//         console.error('Error during update:', error);
//         return false;
//     }
// };


const postFormData = async (data) => {
    try {
        const dt = new Date();
        let sign, pic, sync
        
        let { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by } = data;

        if(photo !== null || signature !== null){
            sign = await base64ToImageSign(signature)
            pic = await base64ToImageFlow(photo)
        }
        
        sync = dt
        
        const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, sign, type, pic, sync, created_by ];

        const date = formatYYYYMMDD(date_trx)
        if (data.no_unit.includes('LV') || data.no_unit.includes('HLV')) {
            const updateQuery = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 and "date" = $3`;
        
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.no_unit, date]);
<<<<<<< HEAD
            if (existingData.rows.length > 0) {
=======
	    if (existingData.rows.length > 0) {
>>>>>>> 580be63 (update)
                qty += existingData.rows[0].used;
                if (qty > existingData.rows[0].quota) {
                    return 'This unit has exceeded its quota limit!';
                }
            }
            const updateValues = [qty, data.no_unit, date];
            await db.query(updateQuery, updateValues);
        }

        await db.query(
            `INSERT INTO log_form_data (
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, "start", "end",
              fbr, lkf_id, signature, "type",
              status, photo, created_at, updated_at, created_by
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11,
              $12, $13, $14, $15,
              $16, $17, $18, $19,
              $20, $21, NOW(), NOW(), $22
            )`,
            [
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, start, end,
              fbr, lkf_id, sign, type,
              'add', photo, created_by 
            ]
        );

        const result = await db.query(QUERY_STRING.postFormData, params);
        return result.rowCount > 0;
    } catch (error) {
        logger.error(error);
        console.error('Error during update:', error);
        return false;
    }
};

const insertToForm = async (dataJson) => {
    try {
        const sanitizedColumns = Object.keys(dataJson).map(key => `"${key}"`);
        const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');
        const createOperatorQuery = `
          INSERT INTO form_data (${sanitizedColumns.join(', ')})
          VALUES (${valuesPlaceholders})
        `;

        const values = Object.keys(dataJson).map(key => dataJson[key]);
        
        const result = await db.query(createOperatorQuery, values);

        const {
            from_data_id,
            no_unit,
            model_unit,
            owner,
            date_trx,
            hm_last,
            hm_km,
            qty_last,
            qty,
            flow_start,
            flow_end,
            jde_operator,
            name_operator,
            start,
            end,
            fbr,
            lkf_id,
            signature,
            type,
            photo
        } = dataJson;

        await db.query(
            `INSERT INTO log_form_data (
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, "start", "end",
              fbr, lkf_id, signature, "type",
              status, photo, created_at, updated_at, created_by
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11,
              $12, $13, $14, $15,
              $16, $17, $18, $19,
              $20, $21, NOW(), NOW(), $22
            )`,
            [
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, start, end,
              fbr, lkf_id, signature, type,
              'add', photo, 'fuelman' 
            ]
        );

        if(result){
            return true
        }
        return false

    } catch (error) {
        logger.error(error)
        console.log(error)
        return false
    }
}

const deleteForm = async (params) => {
    try{
        const getData = await db.query(QUERY_STRING.getDataId, [params])
        const extractedData = getData.rows.map(item => ({
            unit: item.no_unit,
            date: item.date_trx,
            qty : item.qty
        }));

        for (const data of extractedData) {
            const date = formatYYYYMMDD(data.date)
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.unit, date]);
            let updatedUsed
            if(existingData.rows.length > 0){
                updatedUsed = existingData.rows[0].used - data.qty; 
            }
            const params = [updatedUsed, data.unit, date]
            const query = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 and "date" = $3`;
            const res = await db.query(query, params)
          
        }

        const {
            from_data_id,
            no_unit,
            model_unit,
            owner,
            date_trx,
            hm_last,
            hm_km,
            qty_last,
            qty,
            flow_start,
            flow_end,
            jde_operator,
            name_operator,
            start,
            end,
            fbr,
            lkf_id,
            signature,
            type,
            photo
        } = getData.rows[0];

        await db.query(
            `INSERT INTO log_form_data (
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, "start", "end",
              fbr, lkf_id, signature, "type",
              status, photo, created_at, updated_at, created_by
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11,
              $12, $13, $14, $15,
              $16, $17, $18, $19,
              $20, $21, NOW(), NOW(), $22
            )`,
            [
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, start, end,
              fbr, lkf_id, signature, type,
              'deleted', photo, "Admin"
            ]
        );

        const res = await db.query(QUERY_STRING.DELETE_FORM_DATA, [params])
        if(res){
            return true
        }else{
            return false
        }
        return false
    }catch (error){
        console.log(error)
        logger.error(error)
        return false
    }
}

const editForm = async (updateFields) => {
    try {
        await db.query('BEGIN');

        const dates = formatYYYYMMDD(updateFields.date_trx);

        // Ambil data kuota berdasarkan unit baru
        const currQuotaData = await db.query(QUERY_STRING.getExistingQuota, [updateFields.no_unit, dates]);
        const quotaExists = currQuotaData.rowCount > 0;

        // Ambil qty dan type sebelumnya
        const oldFormQuery = 'SELECT qty, type FROM form_data WHERE id = $1';
        const oldForm = await db.query(oldFormQuery, [updateFields.id]);

        const oldQty = parseFloat(oldForm.rows[0].qty);
        const oldType = oldForm.rows[0].type;
        const isOldIssued = oldType === 'Issued';
        const isNewIssued = updateFields.type === 'Issued';

        // CASE 1: Jika unit berubah
        if (updateFields.unitBefore && updateFields.unitBefore !== updateFields.no_unit) {
            const oldQuotaData = await db.query(QUERY_STRING.getExistingQuota, [updateFields.unitBefore, dates]);
            const oldQuotaExists = oldQuotaData.rowCount > 0;
            const newQuotaExists = currQuotaData.rowCount > 0;

            // Kurangi dari unit lama jika sebelumnya Issued
            if (oldQuotaExists && isOldIssued) {
                const usedOld = parseFloat(oldQuotaData.rows[0].used);
                const totalOld = usedOld - oldQty;
                const queryOld = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 AND "date" = $3`;
                await db.query(queryOld, [totalOld, updateFields.unitBefore, dates]);
            }

            // Tambah ke unit baru jika sekarang Issued
            if (newQuotaExists && isNewIssued) {
                const usedNew = parseFloat(currQuotaData.rows[0].used);
                const limitNew = parseFloat(currQuotaData.rows[0].quota) + parseFloat(currQuotaData.rows[0].additional);
                const totalNew = usedNew + parseFloat(updateFields.qty);

                if (totalNew > limitNew) {
                    return await rollbackAndLog('Used kuota pada unit baru melebihi limit');
                }

                const queryNew = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 AND "date" = $3`;
                await db.query(queryNew, [totalNew, updateFields.no_unit, dates]);
            }
        }

        // CASE 2: Jika unit tidak berubah
        else if (quotaExists) {
            let used = parseFloat(currQuotaData.rows[0].used);
            const limit = parseFloat(currQuotaData.rows[0].quota) + parseFloat(currQuotaData.rows[0].additional);

            if (isOldIssued && !isNewIssued) {
                used -= oldQty;
            } else if (!isOldIssued && isNewIssued) {
                used += parseFloat(updateFields.qty);
            } else if (isOldIssued && isNewIssued) {
                used = used - oldQty + parseFloat(updateFields.qty);
            }

            if (used > limit) {
                return await rollbackAndLog('Perubahan qty melebihi limit kuota');
            }

            const updateQuotaQuery = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 AND "date" = $3`;
            await db.query(updateQuotaQuery, [used, updateFields.no_unit, dates]);
        }

        // Update data ke form_data (exclude id, unitBefore, qtyBefore)
        const fieldsToUpdate = Object.keys(updateFields).filter(
            field => field !== 'id' && field !== 'unitBefore' && field !== 'qtyBefore'
        );

        const setClauses = fieldsToUpdate.map((field, idx) => {
            const escapedField = field === 'end' ? `"${field}"` : field;
            return `${escapedField} = $${idx + 1}`;
        }).join(', ');

        const values = fieldsToUpdate.map(field => updateFields[field]);
        values.push(updateFields.id); // for WHERE id = $n

        const updateQuery = `UPDATE form_data SET ${setClauses} WHERE id = $${values.length}`;
        const result = await db.query(updateQuery, values);

        // Ambil semua nilai dari updateFields
        const {
            from_data_id,
            no_unit,
            model_unit,
            owner,
            date_trx,
            hm_last,
            hm_km,
            qty_last,
            qty,
            flow_start,
            flow_end,
            jde_operator,
            name_operator,
            start,
            end,
            fbr,
            lkf_id,
            signature,
            type,
            photo,
            updated_by
        } = updateFields;

        await db.query(
            `INSERT INTO log_form_data (
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, "start", "end",
              fbr, lkf_id, signature, "type",
              status, photo, created_at, updated_at, created_by
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11,
              $12, $13, $14, $15,
              $16, $17, $18, $19,
              $20, $21, NOW(), NOW(), $22
            )`,
            [
              from_data_id, no_unit, model_unit, owner, date_trx,
              hm_last, hm_km, qty_last, qty,
              flow_start, flow_end,
              jde_operator, name_operator, start, end,
              fbr, lkf_id, signature, type,
              'updated', photo, updated_by // untuk created_by juga
            ]
        );

        await db.query('COMMIT');
        return result.rowCount > 0;

    } catch (error) {
        console.error(error);
        await db.query('ROLLBACK');
        logger.error(error);
        return false;
    }
};
  

const rollbackAndLog = async (message) => {
    await db.query('ROLLBACK');
    console.error(message);
    return false;
};


module.exports = {
    postFormData,
    insertToForm,
    editForm,
    deleteForm
}
