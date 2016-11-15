/**
 * Created by yangw on 2016/11/8.
 */
/**
 * Created by yangw on 2016/8/23.
 * 课程数据模型
 * courseName -- 课程名字
 * courseAbstract -- 课程概述
 * courseType -- 课程类型
 * courseContent -- 课程内容
 * teacher -- 课程讲师
 * price -- 课程价格
 * date -- 发布日期
 * clickRate -- 课程阅读点击量
 */

// 获取当前时间
var getDate = require('./tools/GetDate');
var mongoose = require('mongoose');
var courseSchema = require('./db_schema/course_schema').courseSchema;

/* 构造函数 */
function Course(course){

    // 新建课程数据
    this.courseData = {

        courseName : course.courseName || "null",
        courseAbstract : course.courseAbstract,
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

    var db = mongoose.connect('mongodb://localhost/GuideFishing');
    var Course = mongoose.model('Course', courseSchema);
    var courseData = this.courseData;

    mongoose.connection.once('open', function () {
        var newCourse = new Course(courseData);
        newCourse.save(function (err, doc) {

            if(err){
               console.log(err);
               mongoose.disconnect();
               return callback(err);
            }
            mongoose.disconnect();
            callback(null);
        });
    });
};

/* 读取一个课程数据 */
Course.readOne = function (totalCondition, callback) {

    var db = mongoose.connect('mongodb://localhost/GuideFishing');
    var Course = mongoose.model('Course', courseSchema);

    mongoose.connection.once('open', function () {

        var query = Course.findOne();
        query.where(totalCondition.condition);
        if(totalCondition.select){
            query.select(totalCondition.select);
        }
        query.exec(function (err, doc) {
            if(err){
                callback(err, null);
                console.log(err);
                return mongoose.disconnect();
            }
            // 返回的数据
            var data = {
                courseContent: doc.courseContent,
                teacher: doc.teacher,
                date: doc.date
            };
            callback(null, data);
            return mongoose.disconnect();
        });
    });
};

/* 读取课程列表 */
Course.readList = function (docCondition, callback) {

    var db = mongoose.connect('mongodb://localhost/GuideFishing');
    var Course = mongoose.model('Course', courseSchema);

    mongoose.connection.once('open', function () {

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
                mongoose.disconnect();
                return callback(err);
            }
            for(var i in docs) {
                courseArray.push(docs[i]);
            }
            mongoose.disconnect();
            //返回对象数组
            callback(null, courseArray);
        });
    });
};

/* 更新一个课程数据 */
Course.update = function (condition, callback) {


};


module.exports = Course;