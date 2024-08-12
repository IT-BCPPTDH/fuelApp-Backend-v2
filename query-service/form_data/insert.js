const db = require('../../database/helper');
const { base64ToImage } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const postFormData = async (data) => {
    try {
        const dt = new Date()
        
        const { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, dip_start, dip_end, sonding_start, sonding_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, reference, photo, fuelman_id } = data

        let sign = await base64ToImage(signature)
        let pic = await base64ToImage(photo)

        const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, dip_start, dip_end, sonding_start, sonding_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, reference, photo, fuelman_id ]
        
        let result = await db.query(QUERY_STRING.postFormData, params)
        
        if(result.rowCount>0){
            return true
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
    postFormData
}