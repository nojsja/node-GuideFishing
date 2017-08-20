/**
 * Created by yangw on 2016/10/12.
 * mongodb启动的一些配置参数
 */

var bluebird = require('bluebird');

module.exports = {

    cookieSecret: 'GuideFishing',
    db: 'GuideFishing',
    host: '47.91.233.156',
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
    connectionString: "mongodb://47.91.233.156:27017/GuideFishing"
};
