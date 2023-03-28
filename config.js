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

appConfig.ACCESS_TOKEN_SECRET = "3e9af42de397cfc9387a06972c28c23a1ac7e9a60fb6dc1f05295bc6057baf500672d4a13db5d04ea84bbc4c5679164a7723f3d49f516bb73dc3df6e3b768c8e";
appConfig.REFRESH_TOKEN_SECRET = "56a6d157ad7d2ee09e480960ae857e528ae546d156f47433b1afad162311c45aa520697b65d13a5c72891f6145ab1f2675886fc124027dc95f86073dd8fe1462";


module.exports = {
    port: appConfig.port,
    hostname: appConfig.hostname,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db: appConfig.db,
    apiVersion: appConfig.apiVersion,
    ACCESS_TOKEN_SECRET: appConfig.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: appConfig.REFRESH_TOKEN_SECRET
};

// dns2.bigrock.in
// dns4.bigrock.in
