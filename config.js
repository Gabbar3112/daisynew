let appConfig = {};

appConfig.port = 5000;
appConfig.hostname = 'localhost';
appConfig.allowedCorsOrigin = "*";
appConfig.env = "production npm start";
appConfig.db = {
    // uri: 'mongodb+srv://ecommarcedb:Ab88Mi!318@mydb.i78bf.mongodb.net/myallinoneproject?retryWrites=true&w=majority'
    uri: "mongodb+srv://ecommarcedb:Ab88Mi!318@mydb-shard-00-00.i78bf.mongodb.net:27017,mydb-shard-00-01.i78bf.mongodb.net:27017,mydb-shard-00-02.i78bf.mongodb.net:27017/myallinoneproject?ssl=true&replicaSet=mydb-shard-0&authSource=admin&retryWrites=true&w=majority",
    // uri: 'mongodb://localhost:27017/aakriti'
};
appConfig.apiVersion = '/api/v1';

module.exports = {
    port: appConfig.port,
    hostname: appConfig.hostname,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db: appConfig.db,
    apiVersion: appConfig.apiVersion,
};

// dns2.bigrock.in
// dns4.bigrock.in
