/**
 * Created by yangw on 2016/10/12.
 * mongodb启动的一些配置参数
 */

var bluebird = require('bluebird');

module.exports = {

    cookieSecret: 'GuideFishing',
    db: 'GuideFishing',
    host: 'localhost',
    port: 27017,
    user: "zykc",
    password: "normal",
    options: {
        server: {
            auto_reconnect: true,
            poolSize: 10
        },
        promiseLibrary: bluebird
    },
    connectionString: "mongodb://localhost:27017/GuideFishing"
};