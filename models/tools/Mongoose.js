/**
 * Created by yangw on 2016/11/15.
 * mongodb 初始化对象
 * 可以返回数据库对象信息
 */

/** 注:
 * 全局共享一个mongoose
 * */

var locateRoot = require('./LocateFromRoot');
var mongoose = require('mongoose');
var MongoConfig = require(locateRoot('/MongoConfig.js'));

// 初始化方法
function init() {

        // 开启Mongodb数据库连接
        mongoose.connect(MongoConfig.connectionString,
            MongoConfig.options, function (err, res) {

                if(err){
                    console.log('[mongoose log] Error connecting to: ' +
                        MongoConfig.connectionString + '. ' + err);

                }
            });

        // 进程停止后断开连接
        process.on('SIGINT', function() {
            mongoose.connection.close(function () {
                console.log('Mongoose disconnected through app termination');
                process.exit(0);
            });
        });
}

// 初始化数据库
init();

// 导出mongoose对象
module.exports = mongoose;
