const db = require('../../database/helper');
const { base64ToImageSign } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const closeFormLkf = async (data) => {
    try {
        const dt = new Date()
        const { hm_end, fuelman_id, closing_dip, closing_sonding, flow_meter_end,note,signature,sign,lkf_id, close_data, variant } = data

        // let sign = await base64ToImageSign(signature)
        // let sign = "await base64ToImageSign(signature)"

        const params = [hm_end,closing_dip,closing_sonding,flow_meter_end,fuelman_id,dt,note,sign, close_data, variant, lkf_id]

        await db.query(`update log_form_lkf set hm_end = $1, 
            closing_dip = $2, closing_sonding = $3, flow_meter_end = $4, updated_by = $5,
            updated_at = $6, note = $7, signature = $8, status = 'Add'
            where lkf_id = $9`,
            [hm_end, closing_dip, closing_sonding, flow_meter_end, fuelman_id, dt, note,
                sign, lkf_id
            ]
        )

        let result = await db.query(QUERY_STRING.closeFromLKF, params)
        
        if(result.rowCount>0){
            return true;
        }else{
            return false
        }
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    closeFormLkf
}