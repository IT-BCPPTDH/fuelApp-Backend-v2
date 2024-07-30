const db = require('../../database/helper');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const postFormLkf = async (data) => {
    try {
        const dt = new Date()
        const { date, shift, hm_start, site, fuelman_id, station, opening_dip, opening_sonding, flow_meter_start } = data
        const params = [date,shift,hm_start,site,fuelman_id,station,opening_dip,opening_sonding, flow_meter_start, dt, fuelman_id]
        let result = await db.query(QUERY_STRING.postFromLKF, params)
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
    postFormLkf
}