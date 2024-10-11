const { clientMasterData } = require('../../proto/client/master-data');

async function getUnitLvProto(){
    return new Promise((resolve,reject)=>{
        clientMasterData.getUnitLvProto({},(err, response) =>{
            if(!err){
                resolve(response)
            }else{
                reject(err)
            }
        } )  
    })
}

module.exports = {
    getUnitLvProto
}