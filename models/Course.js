/**
 * Created by yangw on 2016/11/8.
 */
/**
 * Created by yangw on 2016/8/23.
 * 课程数据模型
 * courseName -- 课程名字
 * courseAbstract -- 课程概述
 * courseOrigin -- 未处理的原始数据
 * isReady -- 是否时正式课程
 * courseType -- 课程类型
 * courseContent -- 课程内容
 * teacher -- 课程讲师
 * price -- 课程价格
 * date -- 发布日期
 * clickRate -- 课程阅读点击量
 */

// 获取当前时间
var getDate = require('./tools/GetDate');
var mongoose = require('./tools/Mongoose');
var courseSchema = require('./db_schema/course_schema').courseSchema;

/* 构造函数 */
function Course(course){

    // 新建课程数据
    this.courseData = {

        courseName : course.courseName || "null",
        courseAbstract : course.courseAbstract,
        courseOrigin: course.courseOrigin || {
            videos: [],
            images: [],
            texts: [],
            audios: []
        },
        isReady: course.isReady || false,
        courseType : course.courseType,
        courseContent : course.courseContent,
        teacher : course.teacher,
        date : getDate(),
        price : course.price,
        clickRate : 0
    }

}

/* 存储一条课程数据 */
Course.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);
    var courseData = this.courseData;

    var newCourse = new Course(courseData);
    newCourse.save(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        callback(null);
    });

};

/* 导入课程直播数据 */
Course.importFromBroadcast = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);
    // 课程直播元数据
    var courseOrigin = condition.medias;
    // 课程名字
    var courseName = condition.courseName;

    var query = Course.findOne().where({
        courseName: courseName
    });
    query.exec(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        doc.set('courseOrigin', courseOrigin);
        doc.save(function (err) {
            if(err){
                console.log(err);
                return callback(err);
            }
            callback(null);
        });
    });

};

/* 获取所有需要导入的课程数据 */
Course.getLoadData = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    var query = Course.fineOne().where({
       courseName: condition.courseName
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[getLoadData error]: ' + err);
            return callback(err);
        }
        // 返回一个课程的所有数据
        callback(null, doc);
    });
}

/* 获取当前直播课程的原始数据 */
Course.getBroadcastOrigin = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    var query = Course.findOne().where({
       courseName: condition.courseName
    });
    // 选择区间
    query.select({
       courseOrigin: 1 
    });
    // 执行查询
    query.exec(function (err, doc) {
       if(err){
           console.log('[getBroadcastOrigin error]: ' + err);
           return callback(err);
       }
       // 回调返回获取的原始数据
       if(doc){

           callback(null, {
               courseOrigin: doc.courseOrigin
           });
       }else {

           callback(null, null);
       }
    });
};

/** 检查一个课程的直播状态
 * 状态码:
 * isReady -- 正式发布的课程(课程已经不能编辑)
 * noReady -- 待发布的直播课程(课程数据已经存入,课程可以编辑)
 * none -- 没有获取到相应的课程数据(查询不到数据记录)
 * */
Course.checkStatus = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    // 课程状态
    var status = {
        ing: 'noReady',
        done: 'isReady',
        none: 'none'
    }
    var query = Course.findOne().where({
        courseName: condition.courseName
    });
    query.select({
       isReady: 1
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[checkStatus error]:' + err);
            callback(err);
        }
        // 查询到相应的文档
        if(doc){
            // 正式发布的课程
            if(doc.isReady){
                callback(null, status.done);
            }else {
                // 待发布课程
                callback(null, status.ing);
            }
        }else {
            // 不存在直播课程和正式课程
            callback(null, status.none);
        }
    });
};

/* 正式发布课程 */
Course.publish = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);
    // 需要正式发布的课程
    var courseName = condition.courseName;
    var query = Course.findOne().where({
       courseName: courseName 
    });
    query.exec(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        doc.set('isReady', true);
        doc.save(function (err) {
            if(err){
                console.log(err);
                return callback(err);
            }
            callback(null);
        });
    });
};

/* 更新课程数据 */
Course.update = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    // 筛选的课程名
    var courseName = condition.courseName;
    // 所有可以更新的字段
    var allSegment = ['courseName', 'courseType', 'courseAbstract', 'isReady',
        'courseContent', 'teacher', 'price', 'clickRate'];

    var query = Course.findOne().where({
        courseName: courseName
    });
    // 执行查找更新
    query.exec(function (err, doc) {
        if(err){
            console.log(err);
            return callback(err);
        }
        // 更新所有字段
        for(let segment in condition){
            if(allSegment.indexOf(segment) != -1){
                doc.set(segment, condition[segment]);
            }
        }
        query.save(function (err) {
           if(err){
               console.log(err);
               return callback(err);
           }
           callback(null);
        });
    });

};

/* 读取一个课程数据 */
Course.readOne = function (totalCondition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    var query = Course.findOne();
    query.where(totalCondition.condition);
    if(totalCondition.select){
        query.select(totalCondition.select);
    }
    query.exec(function (err, doc) {
        if(err){
            console.log(err);
            return callback(err, null);
        }
        // 返回的数据
        var data = {
            courseContent: doc.courseContent,
            teacher: doc.teacher,
            date: doc.date
        };
        callback(null, data);
    });
};

/* 读取课程列表 */
Course.readList = function (docCondition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    //需要读取的文档的查询条件
    var condition = {};
    /* 读取条目数量 */
    var number = 20;
    /* 跳过读取的条目数量 */
    var skipNum = 0;
    /*** 需要发送给客户端的对象数组 ***/
    var courseArray = [];
    // 筛选区间
    var courseTypeArray = [];

    /* 默认选择的数据项 */
    var select = {
        courseName: 1,
        courseType: 1,
        teacher: 1,
        date: 1,
        clickRate: 1
    };

    /* 进行条件判断客户端的筛选需求 */
    for(var con in docCondition) {

        if(con == "limit") {
            number = docCondition[con];
        }else if(con == "skip") {
            skipNum = docCondition[con];
        }else if(con == "select"){
            select = docCondition[con];
        }else if(con == "testTypeArray"){
            courseTypeArray = docCondition[con];
        } else {
            //复制属性
            condition[con] = docCondition[con];
        }
    }

    // 统计文档数量
    Course.count({}, function (err, count) {

        if(err){
            return callback(err);
        }

        // 判断数量
        // 如果跳过数量超过就显示没有数据
        if(skipNum >= count){
            return callback(null, courseArray);
        }

        var query = Course.find().where(condition);

        if(courseTypeArray.length > 0){
            query.in('courseType', courseTypeArray);
        }
        query.limit(number);
        //定制选择读取的类型
        query.select(select);
        query.skip(skipNum);
        query.sort({date: -1});
        //执行查询
        query.exec(function (err, docs) {
            if(err){
                return callback(err);
            }
            for(var i in docs) {
                courseArray.push(docs[i]);
            }
            //返回对象数组
            callback(null, courseArray);
        });

    });
};

/* 更新一个课程数据 */
Course.update = function (condition, callback) {


};


module.exports = Course;