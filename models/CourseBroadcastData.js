/**
 * Created by yangw on 2016/11/24.
 * 课程直播数据存储模式
 */

/* 导入模块 */
var Mongoose = require('./tools/Mongoose');
var courseBroadcast_schema = require('./db_schema/courseBroadcast_schema')
    .courseBroadcast_schema;

/* 构造函数 */
function CourseBroadcastData(broadcast){

    this.broadcast = broadcast;
}

/* 存储一个课程的直播信息 */
CourseBroadcastData.prototype.save = function (callback) {

    // 引入已经建立连接的mongoose
    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var broadcast = this.broadcast;
    var Broadcast = mongoose.model("Broadcast", courseBroadcast_schema);

    CourseBroadcastData.deleteIfExit({ courseName: broadcast.courseName }, function (err) {

        if(err){
            return callback(err);
        }
        // 新建数据
        var newBroadcast = new Broadcast(broadcast);
        newBroadcast.save(function (err, doc) {
            if(err){
                return callback(err);
            }
            console.log('新建了一个直播课程:　' + doc);
            callback(null);
        });
    });
};

/* 如果存在就删除 */
CourseBroadcastData.deleteIfExit = function (condition, callback) {

    var mongoose = Mongoose;
    var Broadcast = mongoose.model('Broadcast', courseBroadcast_schema);

    var query = Broadcast.findOne();
    query.where(condition);

    // 执行搜索删除
    query.exec(function (err, doc) {

        if(err){
            console.log('[deleteIfExit error]: ' + err);
            return callback(err);
        }
        // 文档存在
        if(doc){
            // 删除本条数据
            doc.remove(function (err, deletedDoc) {
                if(err){
                    console.log('[deleteIfExit error]: ' + err);
                    return callback(err);
                }
                callback(null);
            });
        }else {
            callback(null);
        }
    });

};

/* 讲师登录 */
CourseBroadcastData.teacherLogin = function (condition, callback) {

    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Broadcast = mongoose.model('broadcast', courseBroadcast_schema);
    
    var query = Broadcast.findOne().where({
        courseName: condition.courseName
    });

    console.log(condition);
    // 执行查询
    query.exec(function (err, doc) {

        console.log(doc);
        if(err){
            console.log('[teacherLogin error]: ' + err);
            return callback(err);
        }
        // 数据存在
        if(doc){
            if(doc.teacher.name == condition.teacher &&
                doc.teacher.password == condition.password){
                // 登录成功
                return callback(null, true);
            }
            // 登录失败
            return callback(null, false);
        }else {
            console.log('[teacherLogin none]: 用户不存在');
            callback(null, false);
        }
    });
};

/* 读取直播课程列表 */
CourseBroadcastData.readList = function (docCondition, callback) {

    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Broadcast = mongoose.model('Broadcast', courseBroadcast_schema);

    // 需要读取的文档的查询条件
    // 获取正式发布的课程
    var condition = {};
    /* 读取条目数量 */
    var number = 20;
    /* 跳过读取的条目数量 */
    var skipNum = 0;
    /*** 需要发送给客户端的对象数组 ***/
    var broacastArray = [];

    /* 进行条件判断客户端的筛选需求 */
    for(var con in docCondition) {

        if(con == "limit") {
            number = docCondition[con];
        }else if(con == "skip") {
            skipNum = docCondition[con];
        }else {
            //复制属性
            condition[con] = docCondition[con];
        }
    }

    // 统计文档数量
    Broadcast.count({}, function (err, count) {

        console.log('count: ' + count);

        if(err){
            return callback(err);
        }
        // 判断数量
        // 如果跳过数量超过就显示没有数据
        if(skipNum >= count){
            return callback(null, broacastArray);
        }

        var query = Broadcast.find().where(condition);

        query.limit(number);
        query.skip(skipNum);
        query.sort({date: -1});
        //执行查询
        query.exec(function (err, docs) {
            if(err){
                return callback(err);
            }
            for(var i in docs) {
                broacastArray.push(docs[i]);
            }
            //返回对象数组
            callback(null, broacastArray);
        });

    });
};

/* 保存听课的一个用户的信息 */
CourseBroadcastData.addLearner = function (condition, callback) {

    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Model = mongoose.model('Broadcast', courseBroadcast_schema);

    // 筛选数据
    var _condition = {
        courseName: condition.courseName
    };
    // 直播课程名
    var broadcastCourseName = _condition.courseName;
    _condition.courseName = broadcastCourseName;
    // 导入的用户
    var learner = { name: _condition.name };

    // 找到一个课程更新用户数据
    var query = Model.fineOne().where(_condition);
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
       if(doc){
           doc.remove(function (err, doc) {
               if(err){
                   console.log('[broadcast remove error]:' + err);
                   callback(err);
               }
               console.log('直播课程删除成功!');
               callback(null);
           });
       }
       else {
           var error = new Error('未找到直播数据');
           callback(error);
       }
    });
};

/* 检查直播是否存在 */
CourseBroadcastData.checkBroadcastStatus = function (condition, callback) {

    var db = Mongoose.connection;
    var mongoose = Mongoose;
    var Model = mongoose.model('Broadcast', courseBroadcast_schema);

    var query = Model.findOne().where({
        courseName: condition.courseName
    });

    query.exec(function (err, doc) {

        if(err){
            console.log('[getOne error]: ' + err);
            return callback(err);
        }
        // 获取到直播数据
        if(doc){
            callback(null, true);
            // 获取不到直播数据
        }else {
            callback(null, false);
        }
    });
};

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
};


module.exports = CourseBroadcastData;