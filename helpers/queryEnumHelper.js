
const QUERY_STRING = {
    getLastLKF:`SELECT * 
    FROM form_lkf fl 
    WHERE station = $1 
      AND "date" = (
          SELECT MAX("date") 
          FROM form_lkf 
          WHERE station = $1
      )
    ORDER BY updated_at DESC
    LIMIT 1;`,
  
   getLastLKFAll:`SELECT DISTINCT ON (station) station, hm_end, closing_dip, closing_sonding,close_data,flow_meter_end
        FROM form_lkf
        ORDER BY station, created_at DESC;`,  
  
    postFromLKF : `insert into form_lkf (lkf_id,date,shift,hm_start,site,fuelman_id,station,opening_dip,opening_sonding,flow_meter_start,time_opening, created_by,status)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Open') returning *`,
    closeFromLKF:`update form_lkf set hm_end = $1, closing_dip = $2, closing_sonding = $3, flow_meter_end = $4, updated_by = $5, updated_at = $6, note = $7, signature = $8, close_data = $9, variant = $10, status = 'Close'
    where lkf_id = $11`,

    postFormData:`insert into form_data (from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, "end", fbr, lkf_id, signature, type, photo, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    
    DELETE_FORM_DATA: `DELETE FROM form_data where from_data_id = $1`,

    getLastDataByStation: `select * from form_data 
    where no_unit = $1 AND date_trx < $2 and "type" = 'Issued'
    ORDER BY created_at Desc LIMIT 1;`, 

    getLastDataMonth: `select * from form_data 
    where date_trx between $1 and $2
    ORDER BY date_trx Desc`, 

    getLasTrx:`
        SELECT DISTINCT ON (fd.no_unit) no_unit, hm_km,qty
        FROM form_data fd
        ORDER BY fd.no_unit, fd.created_at DESC;`,

    getExistingQuota : `select * from quota_usage where "unit_no" = $1 and "date" = $2 and "isDelete" = false and is_active = true`,


    getPreviousData: `select * from form_lkf fl where fl.station = $1
    ORDER BY shift DESC LIMIT 1 OFFSET 1`, 

    getDataByDate: `Select * from form_data where  DATE(date_trx) = ANY($1) AND "isDelete" = false`,

    insert_log : `INSERT INTO fuelman_log(lkf_id, date, jde_operator, name_operator, station) VALUES($1, $2, $3, $4, $5)`,
    update_log : `UPDATE fuelman_log SET logout_time = $1 WHERE lkf_id = $2 and "date" = $3`,
    getLogId: `select * from fuelman_log where jde_operator = $1 AND station = $2`,


    getTotalLkfs: `select SUM(fl.closing_dip) as total_closing,
    SUM(fl.close_data) As total_close_data,
    SUM(fl.variant) As total_variant from form_lkf fl 
    where fl."date" between $1 and $2`,

    getClosing : `select fl.station, fl.shift, fl.closing_dip from form_lkf fl 
    WHERE "date" between $1 and $2`,

    getList : `select distinct fl.station, fl.shift, fl.opening_dip, fl.closing_dip as closing from form_lkf fl 
    WHERE fl."date" between $1 and $2`,

    getTotalType : `select 
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END),0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END),0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END),0) AS total_receive_kpc,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END),0) AS total_receive
    from form_data fd
    where fd.date_trx between $1 and $2`,

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
        SUM(fl.opening_dip) AS total_opening, 
        SUM(fl.closing_dip) AS total_closing,
        SUM(fl.close_data) AS total_close_data,
        fl.variant AS total_variant,
        COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
        COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
        COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
        COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
            FROM form_lkf fl
            LEFT JOIN form_data fd ON fd.lkf_id = fl.lkf_id
            WHERE fl.date BETWEEN $1 AND $2
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
    WHERE fl.station = $1 AND fl."date" between $2 and $3`,

    getShiftStationTK: `SELECT 
        fl.lkf_id, fl."date", fl.shift, fl.station, fl.fuelman_id, fl."status", fl.time_opening
    FROM form_lkf fl
    WHERE fl.station LIKE $1 AND fl."date" between $2 and $3`,


    getLogStation: `select * from fuelman_log fl 
    where station = $1 AND "date" between $2 and $3`,

    getLogStationTK: `select * from fuelman_log fl 
    where fl.station LIKE $1 AND fl."date" between $2 and $3`,

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

    getTableFormData: `select * from form_data fd where lkf_id = $1 and fd."isDelete" = false`,

    addQuota: `INSERT INTO form_table_request(date, shift, unit_no, model, quota_request, reason,  document, request_by, request_name, approve_by, 
        approve_name, created_at, created_by) 
        values($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12, $13)`,
    
    getQuotaTotal:`select SUM(ftr.quota_request) as total, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1`,
 
    getTotalByShiftDay: `select SUM(ftr.quota_request) as total_day, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1 and ftr.shift = 'Day'`,

    getTotalByShiftNight: `select SUM(ftr.quota_request) as total_night, count(ftr.unit_no) as total_unit from form_table_request ftr 
    where ftr."date" = $1 and ftr.shift = 'Night'`,

    getAllReq:`select * from form_table_request ftr where ftr."date" = $1`,


    getHomeTotals : `SELECT 
        fl.date, 
        fl.station, 
        SUM(DISTINCT fl.opening_dip) AS total_opening, 
        fl.variant AS total_variant,  
        SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END) AS total_issued,
        SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END) AS total_transfer,
        SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END) AS total_receive,
        SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END) AS total_receive_kpc,
        fl.flow_meter_start,  
        fl.flow_meter_end,  
        fl.shift     
        FROM 
            form_lkf fl
        LEFT JOIN 
            form_data fd ON fd.lkf_id = fl.lkf_id  
        WHERE 
            fl.lkf_id = $1  
        GROUP BY 
            fl.date, fl.station, fl.variant, fl.flow_meter_start, fl.flow_meter_end, fl.shift`,


    getHomeTable: `select * from form_data fd 
    where fd.lkf_id = $1`,

    getDataId: `select * from form_data fd 
    where fd.from_data_id = $1`,
    

    getStationShiftDay: `select  SUM(distinct fl.opening_dip) as total_open, fl.shift, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date" between $1 and $2 and fl.shift = 'Day' and fl.station = $3
    group by fl.shift`,

    getTKShiftDay: `select  SUM(distinct fl.opening_dip) as total_open, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date" between $1 and $2 and fl.shift = 'Day' and fl.station LIKE $3`,

    getStationShiftNigth: `select  SUM(distinct fl.opening_dip) as total_open, fl.shift, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  between $1 and $2 and fl.shift = 'Night' and fl.station = $3
    group by fl.shift`,

    getTKShiftNigth: `select  SUM(distinct fl.opening_dip) as total_open, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  between $1 and $2 and fl.shift = 'Night' and fl.station LIKE $3`,

    getAllDataStation :`select SUM(distinct fl.opening_dip) as total_open, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  between $1 and $2 and fl.station = $3`,

    getStationTK :`select SUM(distinct fl.opening_dip) as total_open, SUM(distinct fl.closing_dip) as total_close,
    SUM(distinct fl.variant) AS variant,
    SUM(distinct fl.close_data) AS close_data,
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl."date"  between $1 and $2 and fl.station LIKE $3`,

    getAllQuota : `Select * from quota_usage where "date" Between $1 and $2 and "isDelete" = 'false'`,
    getActiveQuota : `Select * from quota_usage where date = $1 and "isDelete" = 'false' and "is_active" = 'true'`,
    getMaxQuota: `select max(quota) as limited_quota,max(is_active) as activated from quota_usage qu where "date" = $1 and kategori = $2`,
    getQuota : `Select * from quota_usage where "unit_no" = $1 and "is_active" = 'true' ORDER BY "date" desc LIMIT 1`,

    listStasion: `SELECT station from form_lkf where "date" between $1 and $2 group by station`,
    
    getConsumtionAll: `SELECT fd.no_unit, fd.qty, fl.shift, fd.hm_km,
        TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date
    FROM form_lkf fl 
    JOIN form_data fd ON fl.lkf_id = fd.lkf_id 
    WHERE  fl."date" BETWEEN $1 AND $2 and fd."type" ='Issued';`,

    getConsumtion: `SELECT TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date,
    fd.no_unit, SUM(fd.qty) AS total_qty
    FROM form_lkf fl 
    JOIN form_data fd ON fl.lkf_id = fd.lkf_id 
    WHERE fl."date" BETWEEN $1 AND $2 and fd."type" ='Issued'
    AND fl.shift IN ('Day', 'Night') 
    GROUP BY fl."date", fd.no_unit; `,

    getConsumtionShift: `SELECT TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date,
    fd.no_unit,fl.shift, SUM(fd.qty) AS total_qty
    FROM form_lkf fl 
    JOIN form_data fd ON fl.lkf_id = fd.lkf_id 
    WHERE fl."date" BETWEEN $1 AND $2 and fd."type" ='Issued'
    GROUP BY fl."date",fl.shift, fd.no_unit ;`,

    getFCKpc: `select TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date,
    fl.shift,fl.station,fl.fuelman_id, fd.name_operator, fd.qty, fl.opening_dip,  fl.closing_dip, fd."start", fd."end" 
    from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl."date" between $1 and $2 and fd."type" = 'Receipt KPC'`,

    getFCOwn: `select TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date,
    fd.no_unit, fd.qty
    from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl."date" between $1 and $2 and fd."type" ='Issued'`, 
     
    getDataForMailKPC : `select fl."date", fl.station, fd.no_unit, fd.qty, fd."type" from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl."date" between $1 and $2 and fd.type = 'Receipt KPC'`,

    getDataForMailIssued : `select fl."date", fl.station, fd.no_unit, fd.qty, fd."type" from form_lkf fl 
    join form_data fd on fd.lkf_id = fl.lkf_id 
    where fl."date" between $1 and $2 and fd.type = 'Issued'`,

    getHeaderLkf: `select fl.fuelman_id, fl.opening_dip, opening_sonding,
    fl.closing_dip as total_close, closing_sonding,
    fl.flow_meter_start, fl.flow_meter_end, fl.hm_start, fl.hm_end, fl.shift, fl.station,
    fl.variant AS variant, TO_CHAR((fl."date"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS formatted_date,
   fl.close_data AS close_data,
       COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
       COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
       COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END),0) AS total_transfer,
       COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
    FROM form_lkf fl
    left join form_data fd on fl.lkf_id = fd.lkf_id 
    where fl.lkf_id = $1
    group by fl."date", fl.fuelman_id, opening_sonding, closing_sonding, fl.opening_dip, fl.closing_dip,fl.flow_meter_start, 
    fl.variant,fl.close_data, fl.flow_meter_end,fl.opening_sonding, fl.hm_start, fl.hm_end, fl.shift, fl.station`,

    getClosingDip : `select sum(fl.closing_dip) as total_before from form_lkf fl 
    where fl."date" between $1 and $2 and shift = 'Night'`,

    getLkfSum : `select fl.station, SUM(fl.opening_dip) as total_opening, sum(fl.closing_dip) as total_closing, 
    SUM(fl.close_data) as close_data, sum(fl.variant) as variant from form_lkf fl 
    WHERE fl.date BETWEEN $1 AND $2 group by 1`,

    getFormSum : `SELECT  fl.station, 
    COALESCE(SUM(CASE WHEN fd.type = 'Issued' THEN fd.qty ELSE 0 END), 0) AS total_issued,
    COALESCE(SUM(CASE WHEN fd.type = 'Transfer' THEN fd.qty ELSE 0 END), 0) AS total_transfer,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt' THEN fd.qty ELSE 0 END), 0) AS total_receive,
    COALESCE(SUM(CASE WHEN fd.type = 'Receipt KPC' THEN fd.qty ELSE 0 END), 0) AS total_receive_kpc
        FROM form_lkf fl LEFT JOIN form_data fd ON fd.lkf_id = fl.lkf_id
        WHERE fl.date BETWEEN $1 AND $2 GROUP BY fl.station;`,

    getClosingDipStation : `select sum(fl.closing_dip) as total_before from form_lkf fl 
        where fl."date" between $1 and $2 and fl.shift = 'Night'`,
    
    prevOpeningStation : `SELECT fl.station,
    SUM(CASE WHEN fl.shift = 'Day' THEN fl.opening_dip ELSE 0 END) AS total_opening_day,
    SUM(CASE WHEN fl.shift = 'Night' THEN fl.closing_dip ELSE 0 END) AS total_closing_night
    FROM form_lkf fl WHERE fl."date" BETWEEN $1 AND $2
    GROUP  fl.station`,

    closingPrevStation : `select fl.station, fl.closing_dip as closing_dip_before from form_lkf fl 
        where fl."date" between $1 and $2 and fl.shift = 'Night' GROUP BY 1,2`,

    openingDipDay : `select fl.station, fl.opening_dip as opening_dip_day from form_lkf fl 
        where fl."date" between $1 and $2 and fl.shift = 'Day' GROUP By 1,2`,


    getLkfById : `Select * from form_lkf where lkf_id = $1`,
    deleteStation : `BEGIN;
    -- Hapus dari tabel form_lkf
    DELETE FROM form_lkf
    WHERE lkf_id = $1;

    -- Hapus dari tabel form_data
    DELETE FROM form_data
    WHERE lkf_id = $1;

    -- Hapus dari tabel fuelman_log berdasarkan join dengan tabel form_lkf
    DELETE FROM fuelman_log
    USING form_lkf
    WHERE fuelman_log.jde_operator = form_lkf.fuelman_id
      AND fuelman_log."date" = form_lkf."date"
      AND fuelman_log.station = form_lkf.station
      AND form_lkf.lkf_id = $1;
     COMMIT;
     `
}

module.exports = {
    QUERY_STRING
}
