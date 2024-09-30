const db = require('../../database/helper');
const { base64ToImageSign } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const closeFormLkf = async (data) => {
    try {
        const dt = new Date()
        const { hm_end, fuelman_id, closing_dip, closing_sonding, flow_meter_end,note,signature,sign,lkf_id, close_data, variant } = data

        // let sign = await base64ToImageSign(signature)

        const params = [hm_end,closing_dip,closing_sonding,flow_meter_end,fuelman_id,dt,note,sign, close_data, variant, lkf_id]

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