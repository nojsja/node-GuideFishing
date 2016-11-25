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
CourseBroadcastData.prototype.save = function (callback) {

    // 引入已经建立连接的mongoose
    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Model = mongoose.model;

    var model = new Model("Broadcast", courseBroadcast_schema);
    model.save(function (err, doc) {
        if(err){
            return callback(err);
        }
        console.log('新建了一个直播课程:　' + doc);
        callback(null);
    });
};

/* 保存听课的一个用户的信息 */
CourseBroadcastData.addLearner = function (condition, callback) {

    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Model = mongoose.model;

    // 筛选数据
    var condition = {
        courseName: ''
    };
    // 直播课程名
    var broadcastCourseName = condition.courseName;
    condition.courseName = broadcastCourseName;
    // 导入的用户
    var learner = { name: condition.name };

    // 找到一个课程更新用户数据
    var query = Model.fineOne().where(condition);
    query.exec(function (err, doc) {

        if(err){
            return callback(err);
        }
        var query =  doc.update({
            $push: {learners: learner}
        });
        query.exec(function (err, doc) {
           if(err){
               return callback(err);
           }
           callback(null);
        });

    });
};

/* 删除一个课程的直播数据 */
CourseBroadcastData.deleteOne = function (condition, callback) {

    var db = Mongoose.connection;
    var mongose = Mongoose;
    var Model = mongose.model('Broadcast', courseBroadcast_schema);

    var query = Model.findOne().where(condition);
    query.exec(function (err, doc) {
       if(err){
           return callback(err);
       }
       console.log('删除了一个直播: ', doc);
       callback(null);
    });
}

/* 删除多个直播数据 */
CourseBroadcastData.deleteSome = function (condition, callback) {

    var db = Mongoose.connection;
    var mongose = Mongoose;
    var Model = mongose.model('Broadcast', courseBroadcast_schema);

    var query = Model.remove();
    query.where(condition);
    query.exec(function (err, results) {
        if(err){
            return callback(err);
        }
        console.log('删除直播数目: ', results);
        callback(null);
    });
}



module.exports = CourseBroadcastData;