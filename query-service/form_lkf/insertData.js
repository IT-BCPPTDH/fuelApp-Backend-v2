const db = require('../../database/helper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const postFormLkf = async (data) => {
    try {
        const dt = new Date()
        let { lkf_id,date, shift, hm_start, site, fuelman_id, station, opening_dip, opening_sonding, flow_meter_start } = data
        const hm = hm_start?hm_start:0
        const params = [lkf_id,date,shift,hm,site,fuelman_id,station,opening_dip,opening_sonding, flow_meter_start, dt, fuelman_id]
        // console.log(hm)
        // await db.query(`INSERT INTO log_form_lkf (lkf_id, "date", shift, hm_start, site, fuelman_id, station, 
        //     opening_dip, opening_sonding,  flow_meter_start,
        //      "status", time_opening, created_at, created_by) VALUES
        //      ($1, $2, $3, $4, $5,$6, $7, 
        //      $8, $9, $10, $11, NOW(), NOW(), $12)`,
        //     [
        //         lkf_id,date,shift,hm,site,fuelman_id,
        //         station,opening_dip,opening_sonding, flow_meter_start, "Add", fuelman_id
        //     ]
        // )
        let result = await db.query(QUERY_STRING.postFromLKF, params)
        if(result.rowCount>0){
            return result.rows[0];
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
    postFormLkf
}