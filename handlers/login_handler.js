const { loginPost, logoutTab, postLog, editLog } = require("../controllers/login_user_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleLoginPost(res, req) {
    await handleResponseJsonOperator(res, req, loginPost, true )
}

async function handleLogoutPost(res, req) {
    await handleResponseJsonOperator(res, req, logoutTab, true )
}

async function handleLogPost(res, req) {
    await handleResponseJsonOperator(res, req, postLog, true )
}

async function handleLogEdit(res, req) {
    await handleResponseJsonOperator(res, req, editLog, true )
}

module.exports = {
    handleLoginPost,
    handleLogoutPost,
    handleLogPost,
    handleLogEdit
}