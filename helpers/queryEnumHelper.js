const QUERY_STRING = {
    // lkf
    getLastLKF : `select * from form_lkf where station = $1 order by created_at DESC limit 1`,
    postFromLKF : `insert into form_lkf (lkf_id,date,shift,hm_start,site,fuelman_id,station,opening_dip,opening_sonding,flow_meter_start,time_opening, created_by,status)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Open') returning *`,
    closeFromLKF:`update form_lkf set hm_end = $1, closing_dip = $2, closing_sonding = $3, flow_meter_end = $4, updated_by = $5, updated_at = $6, note = $7, signature = $8
    where lkf_id = $9`,

    // form_data
    postFormData:`insert into form_data (from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, dip_start, dip_end, sonding_start, sonding_end, jde_operator, name_operator, start, "end", fbr, lkf_id, signature, type, reference, photo, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
}

module.exports = {
    QUERY_STRING
}
