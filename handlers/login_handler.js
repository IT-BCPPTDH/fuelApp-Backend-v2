const { loginPost, logoutTab } = require("../controllers/login_user_controller");
const { handleResponseJsonOperator, handleResponseParams, checkToken } = require("./httpResponseHandler");

async function handleLoginPost(res, req) {
    await handleResponseJsonOperator(res, req, loginPost, true )
}

async function handleLogoutPost(res, req) {
    await handleResponseJsonOperator(res, req, logoutTab, true )
}


module.exports = {
    handleLoginPost,
    handleLogoutPost
}