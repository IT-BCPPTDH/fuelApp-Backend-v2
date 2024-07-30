const db = require('../../database/helper');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const closeFormLkf = async (data) => {
    try {
        const dt = new Date()
        const { hm_end, fuelman_id, closing_dip, closing_sonding, flow_meter_end,note,signature,no_lkf } = data

        const params = [hm_end,closing_dip,closing_sonding,flow_meter_end,fuelman_id,dt,note,signature,no_lkf]

        let result = await db.query(QUERY_STRING.closeFromLKF, params)
        
        if(result.rowCount>0){
            return true;
        }else{
            return false
        }
    } catch (error) {
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    closeFormLkf
}