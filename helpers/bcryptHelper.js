require('dotenv').config();
const bcrypt = require('bcrypt')
const saltRound = +process.env.SALT_ROUND;

const encrypter = (pwd) => {
    return bcrypt.hashSync(pwd, saltRound)
}

const decrypter = async (pwd, hashPwd) => {
    return await bcrypt.compare(pwd, hashPwd)
}

module.exports = {
    encrypter, decrypter
}