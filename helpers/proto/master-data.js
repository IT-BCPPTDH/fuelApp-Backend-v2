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

async function getEquipment(data){
    return new Promise((resolve,reject)=>{
        clientMasterData.getEquipment({data:data},(err, response) =>{
            if(!err){
                resolve(response)
            }else{
                reject(err)
            }
        } )  
    })
}

async function getFilterBanlaws(data){
    return new Promise((resolve,reject)=>{
        clientMasterData.getFilterBanlaws({data:data},(err, response) =>{
            if(!err){
                resolve(response)
            }else{
                reject(err)
            }
        } )  
    })
}

module.exports = {
    getUnitLvProto,
    getEquipment,
    getFilterBanlaws
}