const loginHandler = require('../handlers/login_handler');
const { checkToken } = require('../helpers/redisTransaction');

module.exports = (app) => {
    app.post('/api/login',(res,req) => loginHandler.handleLoginPost(res,req))
    app.post('/api/logout',(res,req) => loginHandler.handleLogoutPost(res,req))
}