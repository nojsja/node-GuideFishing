/**
 * Created by yangw on 2016/11/15.
 * mongodb 初始化对象
 * 可以返回数据库对象信息
 */

/** 注:
 * 全局共享一个mongoose
 * 使用mongoose连接池不用每次都关闭
 * 只在程序结束的时候关闭连接
 * */

// 使用第三方promise库排除警告
var bluebird = require('bluebird');

var locateRoot = require('./LocateFromRoot');
var mongoose = require('mongoose');
mongoose.Promise = bluebird;

// 配置文件
var MongoConfig = require(locateRoot('/MongoConfig.js'));

console.log('String: ' + MongoConfig.connectionString);

// 开启Mongodb数据库连接
mongoose.connect(MongoConfig.connectionString,
    MongoConfig.options, function (err, res) {

    console.log('mongodb open');
    if(err){
        console.log('[mongoose log] Error connecting to: ' +
            MongoConfig.connectionString + '. ' + err);
    }
});


// 进程停止后自动断开连接
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

// 导出mongoose对象
module.exports = mongoose;
