
let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');

let PROTO_MASTER_DATA = __dirname + '/../.proto/master-data.proto';
let packageMasterData = protoLoader.loadSync(
    PROTO_MASTER_DATA,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
let MasterData = grpc.loadPackageDefinition(packageMasterData).master_data;

const clientMasterData = new MasterData.Greeter(process.env.grpcMasterDataDev,grpc.credentials.createInsecure());

module.exports={
    clientMasterData
}