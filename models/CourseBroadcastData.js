/**
 * Created by yangw on 2016/11/24.
 * 课程直播数据存储模式
 */

/* 导入模块 */
var Mongoose = require('./tools/Mongoose');
var courseBroadcast_schema = require('./db_schema/courseBroadcast_schema');

/* 构造函数 */
function CourseBroadcastData(broadcast){

    this.broadcast = broadcast;
}

/* 存储一个课程的直播信息 */
CourseBroadcastData.prototype.save = function () {

};

/* 删除一个课程的直播数据 */
CourseBroadcastData.delete = function () {
    
}

module.exports = CourseBroadcastData;