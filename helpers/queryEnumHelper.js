const QUERY_STRING = {
    // lkf
    getLastLKF : `select * from form_lkf where station = $1 order by created_at DESC limit 1`,
    postFromLKF : `insert into form_lkf (lkf_id,date,shift,hm_start,site,fuelman_id,station,opening_dip,opening_sonding,flow_meter_start,time_opening, created_by,status)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Open') returning *`,
    closeFromLKF:`update form_lkf set hm_end = $1, closing_dip = $2, closing_sonding = $3, flow_meter_end = $4, updated_by = $5, updated_at = $6, note = $7, signature = $8, close_data = $9, variant = $10, status = 'Close'
    where lkf_id = $11`,

    // form_data
    postFormData:`insert into form_data (from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, "end", fbr, lkf_id, signature, type, photo, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    
    DELETE_FORM_DATA: `UPDATE form_data SET "isDelete" = true WHERE from_data_id = $1`,

    getLastDataByStation: `select * from form_data 
    where no_unit = $1
    LIMIT 1;`, 

    getExistingQuota : `select * from quota_usage where unitNo = $1 and "isDelete" = false`,

    getPreviousData: `select * from form_lkf fl where fl.station = $1
    ORDER BY shift DESC LIMIT 1 OFFSET 1`, 

    getDataByDate: `Select * from form_data where  DATE(date_trx) = ANY($1) AND "isDelete" = false`,

    insert_log : `INSERT INTO fuelman_log(date, jde_operator, name_operator, station) VALUES($1, $2, $3, $4)`,
    update_log : `UPDATE fuelman_log SET logout_time = $1 WHERE id = $2`,
    getLogId: `select * from fuelman_log where jde_operator = $1 AND station = $2`,

    getTotalSonding: `select SUM(DISTINCT fl.opening_dip) as total_opening from form_lkf fl 
    where fl."date" = $1 and shift = 'Day'`,

    getTotalType : `select SUM(fl.closing_dip) as total_closing,
    SUM(distinct fl.close_data) As total_close_data,
    SUM(fl.variant) As total_variant,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END),0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END),0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receive' THEN fd.qty ELSE 0 END),0) AS total_receive
    from form_lkf fl
    left join form_data fd on fd.lkf_id  = fl.lkf_id 
    where fl."date" = $1`,

    // getPrevious : `SELECT sum(fl.opening_sonding) AS total_opening, 
    // SUM(fl.closing_sonding) AS total_closing,
    // SUM(fl.close_data) As total_close_data,
    // SUM(fl.variant) As total_variant
    // FROM form_lkf fl 
    // WHERE fl."date" = $1
    // AND shift = $2;
    // `,

    getPrevious : `SELECT sum(DISTINCT closing_dip) as total_closing, 
    SUM(fl.close_data) As total_close_data, SUM(fl.variant) As total_variant
    FROM form_lkf fl 
    WHERE fl."date" = $1
    AND shift = $2`,

    getAllLkf : `SELECT SUM(distinct fl.opening_dip) AS total_opening FROM form_lkf fl WHERE fl."date" = $1 and fl.shift = 'Day'`,
    getAllLkfs : `SELECT fl.opening_dip AS total_opening FROM form_lkf fl WHERE fl."date" = $1 and fl.shift = 'Day'`,

    getTotals : `SELECT 
        fl.date, 
        fl.station, 
        SUM(distinct fl.opening_dip) AS total_opening, 
        SUM(distinct fl.closing_dip) AS total_closing,
        SUM(distinct fl.close_data) As total_close_data,
        fl.variant As total_variant,
        COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
        COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
        COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
        COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    LEFT JOIN form_data fd ON fd.lkf_id = fl.lkf_id
    WHERE fl.date = $1
    GROUP BY fl.date, fl.station, fl.variant;`,

    getTotalBefores : `SELECT 
            fl.date, 
            fl.station, 
            sum(distinct fl.opening_dip) AS total_opening, 
            SUM(distinct fl.closing_dip) AS total_closing,
            SUM(distinct fl.close_data) As total_close_data,
            SUM(fl.variant) As total_variant,
            COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
            COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
            COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receipt,
            COALESCE(SUM(CASE WHEN fd.type = 'Receipt Supplier' THEN fd.qty ELSE 0 END), 0) AS total_receipt_kpc
        FROM form_lkf fl
        LEFT JOIN form_data fd ON fd.lkf_id = fl.lkf_id
        WHERE fl.date = $1 AND fl.shift = $2
        GROUP BY fl.date, fl.station;`,

    
    getAllLkfTotal : `SELECT * FROM form_lkf fl WHERE fl."date" = $1 and fl.station = $2`,

    getPreviouss : `SELECT SUM(fl.opening_dip) as total_opening, SUM(fl.closing_dip) as total_closing,
        COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
        COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
        COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive
    FROM form_lkf fl 
    LEFT JOIN form_data fd ON fd.lkf_id = fl.lkf_id
    WHERE fl."date" = $1
    AND shift = $2 AND station = $3;`,

    getTotalsStations: `SELECT 
        fl.lkf_id, 
        fl."date", 
        fl.fuelman_id, 
        fl."status", 
        fl.time_opening, 
        fl2.login_time, 
        fl2.logout_time
    FROM form_lkf fl
    JOIN fuelman_log fl2 
        ON fl.date = fl2.date 
        AND fl.fuelman_id = fl2.jde_operator
    WHERE fl.station = $1 
      AND fl."date" = $2;
    `,

    getShiftStation: `SELECT 
        fl.lkf_id, fl."date", fl.shift, fl.station, fl.fuelman_id, fl."status", fl.time_opening
    FROM form_lkf fl
    WHERE fl.station = $1 AND fl."date" = $2`,

    getLogStation: `select * from fuelman_log fl 
    where station = $1 AND "date" = $2`,

    getAllFormData : `select SUM(distinct fl.opening_dip) as total_open, 
    SUM(distinct fl.closing_dip) as total_close, 
    fl.flow_meter_start, fl.flow_meter_end,
       SUM(distinct fl.variant) AS variant,
       SUM(distinct fl.close_data) AS close_data,
       COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
       COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
       COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END),0) AS total_transfer,
       COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl.lkf_id = $1
    group by fl.opening_dip, fl.closing_dip,fl.flow_meter_start, fl.flow_meter_end,fl.opening_sonding`,

    getTableFormData: `select * from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl.lkf_id = $1 and "isDelete" = false`,

    addQuota: `INSERT INTO form_table_request(date, time, shift, unit_no, model, hmkm, station, quota_request, reason, document,request_by, request_name, approve_by, 
        approve_name, created_at, created_by) 
        values($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12, $13,$14,$15, $16)`,
    
    getQuotaTotal:`select SUM(ftr.quota_request) as total, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1`,
 
    getTotalByShiftDay: `select SUM(ftr.quota_request) as total_day, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1 and ftr.shift = 'Day'`,

    getTotalByShiftNight: `select SUM(ftr.quota_request) as total_night, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1 and ftr.shift = 'Night'`,

    getAllReq:`select * from form_table_request ftr where ftr."date" = $1`,

    getHomeTotals : `select fl.date, fl.fuelman_id, fl.shift, fl.station, fl.flow_meter_start, fl.flow_meter_end, SUM(fl.opening_dip) as op_dip,
    SUM(fl.opening_dip) as close_dip,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive
    from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl.lkf_id = $1
    group by fl.date, fl.fuelman_id, fl.shift, fl.station, fl.flow_meter_start, fl.flow_meter_end`,

    getHomeTable: `select fd.no_unit, fd.model_unit, fd.fbr, fd."type", fd.qty,
    fd.flow_start, fd.flow_end, fd.jde_operator, fd.name_operator from form_data fd 
    where fd.lkf_id = $1`,

    getStationShiftDay: `select  SUM(distinct fl.opening_dip) as total_open, fl.shift, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  = $1 and fl.shift = 'Day' and fl.station = $2
    group by fl.shift`,

    getStationShiftNigth: `select  SUM(distinct fl.opening_dip) as total_open, fl.shift, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  = $1 and fl.shift = 'Night' and fl.station = $2
    group by fl.shift`,

    getAllDataStation :`select SUM(distinct fl.opening_dip) as total_open, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  = $1 and fl.station = $2`,

    getAllQuota : `Select * from quota_usage where date = $1 and "isDelete" = 'false'`
}

module.exports = {
    QUERY_STRING
}
