const QUERY_STRING = {
    getLastLKF : `select * from form_lkf where station = $1 order by created_at DESC`,
    postFromLKF : `insert into form_lkf (date,shift,hm_start,site,fuelman_id,station,opening_dip,opening_sonding,flow_meter_start,time_opening, created_by,status)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Open')`,
    closeFromLKF:`update form_lkf set hm_end = $1, closing_dip = $2, closing_sonding = $3, flow_meter_end = $4, updated_by = $5, updated_at = $6, note = $7, signature = $8
    where id = $9`,

    insert_log : `INSERT INTO fuelman_log(date, jde_operator, name_operator, station) VALUES($1, $2, $3, $4)`,
    update_log : `UPDATE fuelman_log SET logout_time = $1 WHERE id = $2`,
    getLogId: `select * from fuelman_log where jde_operator = $1 AND station = $2`
}

// {
//     no_lkf: 990168963962273800,
//     hm_end: 122.02,
//     fuelman_id: '121070',
//     closing_dip: 20.3,
//     closing_sonding: 203,
//     flow_meter_end: 2212.2
//   }
module.exports = {
    QUERY_STRING
}
