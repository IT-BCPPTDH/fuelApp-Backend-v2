const db = require('../../database/helper');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { loginUser, signOut, fetchFromMasterStation } = require('../../helpers/httpHelper')
const { formatYYYYMMDD } = require('../../helpers/dateHelper')

const getDataLogin = async (params) => {
    try {
        const dt = new Date()
        let user  = await loginUser({JDE: params.JDE, password: "abcd1234"})
        if(user.status == 201 || user.status == 200){
            if(user.access.fuelman){
                let getStation = await fetchFromMasterStation(params.station)
                if(getStation.status == 200){
                    const value = [formatYYYYMMDD(dt), user.data.JDE, user.data.fullname, getStation.data[0].fuel_station_name]
                    const insertToLog = await db.query(QUERY_STRING.insert_log, value)
                    const getData = await db.query(QUERY_STRING.getLogId, [params.JDE, params.station])
                    const prevData = await db.query(QUERY_STRING.getPreviousData, [params.station])
                     const data = {
                        logId: getData.rows[0].id,
                        id: user.data.id,
                        jde : user.data.jde,
                        fullname: user.data.fullname,
                        position: user.data.position,
                        division: user.data.division,
                        station: getStation.data[0].fuel_station_name,
                        token: user.session_token,
                        prev : prevData.rows
                    }
                    return { success: true, data }
                }
                return { success: false, message: "Data not found"};
            }
            return { success: false, message: "User is not operator" }
        }
        return { success: false, message: "No user credentials found for the provided Employee ID." };
    } catch (error) {
        console.error('Error during update:', error);
        return false;
    }
};

const logoutUser = async (params) => {
    try {
        const dt = new Date()
        const dateNow = formatYYYYMMDD(dt)
        let user  = await signOut({user_id: params.userId, session_token: params.session_token})
        if(user.status == 200){
            const value = new Date()
            const updateLog = await db.query(QUERY_STRING.update_log, [value, params.logId, dateNow])
            return ({success: true})
        }
        return { success: false, message: "No user credentials found for the provided Employee ID." };
    } catch (error) {
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    getDataLogin,
    logoutUser
}