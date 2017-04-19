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
// 课程模式
var courseSchema = require('./db_schema/course_schema').courseSchema;
// 受欢迎的课程模式
var popularCourseSchema = require('./db_schema/popularCourse_schema').popularCourseSchema;

// Tag 模型
var Tag = require('./Tag');
// Admin 模型
var Admin = require('./Admin');


/* 构造函数 */
function Course(course){

    // 新建课程数据
    this.courseData = {

        courseName : course.courseName || "null",
        courseAbstract : course.courseAbstract,
        courseOrigin: course.courseOrigin || [],
        isReady: course.isReady || false,
        isBroadcast: course.isBroadcast || false,
        courseType : course.courseType,
        courseContent : course.courseContent,
        teacher : course.teacher,
        password: course.password,
        examine: course.examine,
        courseTags: course.courseTags,
        date : getDate(),
        price : course.price,
        clickRate : 0
    };

    // 课程标签(数组)
    if(course.courseTags instanceof Array){

        // 创建新数组的迭代器方法
        this.tagArray = course.courseTags.map(function (item) {

            return {
                tagName: item,
                tagType: "course",
                contentName: course.courseName,
                contentType: course.courseType
            }
        });
    }else {
        this.tagArray = [];
    }
}

/* 存储一条课程数据 */
Course.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Course', courseSchema);
    var Q = require('q');
    // 课程数据
    var courseData = this.courseData;
    // 标签数据
    var tagArray = this.tagArray;

    // 需要记录的审查数据
    var examineData = {
        contentName: this.courseData.courseName,
        contentType: this.courseData.courseType,
        examineType: "course",
        examineText: null,
        adminAccount: this.courseData.examine.adminAccount,
        examineAccount: null,
        status: "isExaming",
        date: getDate()
    };

    // 先进行检查是否已经存在数据
    Course.deleteIfExit({ courseName: courseData.courseName }, function (err) {

        if(err){
            return callback(err);
        }
        // 创建课程
        var newCourse = new Model(courseData);
        newCourse.save(function (err, doc) {

            if(err){
                console.log(err);
                return callback(err);
            }

            var defer = Q.defer();
            defer.promise
                .then(function (info) {

                    var defer = Q.defer();

                    var newTag = new Tag(tagArray);
                    newTag.save(function (err) {
                        if(err){
                            console.log("[error]: " + err );
                            info.isError = true;
                            info.error = err;
                            defer.reject(info);
                        }else {
                            defer.resolve(info);
                        }
                    });

                    return defer.promise;
                })
                .then(function success(info) {

                    var defer = Q.defer();
                    // 提交给审查人
                    Admin.examine('isExaming', examineData, function (err, isPass) {

                        if(err){
                            console.log(err);
                            info.isError = true;
                            info.error = err;
                        }
                        defer.resolve(info);
                    });

                    return defer.promise;

                }, function fail(info) {

                    var defer = Q.defer();

                    console.log(info.error);
                    defer.resolve(info);

                    return defer.promise;
                })
                .done(function (info) {

                    console.log('course save done.');
                    if(info.isError){
                        return callback(info.err);
                    }
                    callback(null, true);
                });

            // 开始
            defer.resolve({
                isError: false,
                error: null
            });

        });
    });
};

/* 检查数据是否存在,如果存在的话先删除数据 */
Course.deleteIfExit = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    var query = Course.findOne();
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
        if(doc){
            // push数据
            for (let index in courseOrigin){
                // 更新单个文档
                doc.courseOrigin.set(index, courseOrigin[index]);
            }
            // 保存更新
            doc.save(function (err) {
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        }else {
            var error = new Error('未找到直播数据');
            callback(error);
        }
    });

};

/* 获取所有需要导入的课程数据 */
Course.getLoadData = function (condition, callback) {

    Course.getData(condition, callback);
};

/* 获取当前直播课程的数据 */
Course.getData = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    var query = Course.findOne().where({
       courseName: condition.courseName
    });
    // 筛选条件映射对象
    var conditionObject = {
        
        select: function (selectArray) {
            // 确定筛选条件
            var _select = {};
            for(let sel in selectArray){
                _select[sel] = 1;
            }
            query.select(_select);
        },
        limit: function (lim) {
            query.limit(lim);
        },
        sort: function (sor) {
            query.sort(sor);
        },
        skip: function (num) {
            query.skip(num);
        }
    };

    // 确定查询对象
    for(var attr in condition){

        if(conditionObject[attr]){
            // 执行筛选方法
            conditionObject[attr]( condition[attr] );
        }
    }

    // 执行筛选查询
    query.exec(function (err, doc) {
       if(err){
           console.log('[getData error]: ' + err);
           return callback(err);
       }
       // 回调返回获取的原始数据
       if(doc){

           callback(null, doc);
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
    };
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

    // 更新操作
    Course.update({
        courseName: courseName,
        isReady: true
    }, callback);
};

/* 更新课程数据 */
Course.update = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    // 筛选的课程名
    var courseName = condition.courseName;
    // 所有可以更新的字段
    var allSegment = ['courseName', 'courseType', 'courseAbstract', 'isReady',
        'isBroadcast', 'courseContent', 'teacher', 'price', 'clickRate'];

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
        // 执行更新
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

        callback(null, doc);
    });
};

/* 读取课程列表 */
Course.readList = function (docCondition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Course', courseSchema);

    // 需要读取的文档的查询条件
    // 获取正式发布的课程
    var condition = {
        isReady: true
    };
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
            console.log('[get courseCount error]: ' + err);
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
                console.log('[readList error]: ' + err);
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

/* 受欢迎的课程数据更新和获取 */
Course.updatePopular = function (callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('course', courseSchema);
    var PopularCourse = mongoose.model('popular_course', popularCourseSchema);

    // 筛选条件
    var condition = {
        select: {
            courseName: 1,
            courseType: 1
        },
        limit: 10,
        sort: {
            clickRate: -1
        }
    };
    var queryCourse = Course.find().where({
        isReady: true
    });
    // 设置筛选
    queryCourse.select(condition.select)
        .limit(condition.limit)
        .sort(condition.sort);

    // 执行
    queryCourse.exec(function (err, docs) {

        if(err){
            console.log('[updatePopular error]:' + err);
            return callback(err);
        }
        // 存储课程数据的数组
        var popularData = [];
        for(let index in docs){
            popularData.push({
                courseName: docs[index].courseName,
                courseType: docs[index].courseType
            });
        }
        console.log(JSON.stringify(popularData));
        // 存储数据
        popularSave(popularData);
    });

    // 存储获取到的数据
    function popularSave(popularArray) {

        // 删除以前的数据
        var query = PopularCourse.remove();
        query.exec(function (err, results) {

            if(err){
                console.log("[popularSave error]: " + err);
                return callback(err);
            }
             console.log('the number of deleted docs: ' + results);

            // 遍历存储数据
            for(let index in popularArray){

                let popularModel = new PopularCourse(popularArray[index]);
                popularModel.save(callback);
            }
            // 回调函数
            function callback(err, saveDoc) {

                if(err){
                    console.log('[popularSave error]: ' + err);
                    return callback(err);
                }
            }
        });
    }
};

/* 获取热门课程数据 */
Course.getPopular = function (callback) {

    var db = mongoose.connection;
    var PopularCourse = mongoose.model('popular_course', popularCourseSchema);

    var query = PopularCourse.find().where({});
    query.exec(function (err, docs) {

        if(err){
            console.log('[getPopular error]: ' + err);
            return callback(err);
        }
        var popularArray  = [];
        for (let index in docs){
            popularArray.push({
                courseName: docs[index].courseName,
                courseType: docs[index].courseType
            });
        }
        console.log('popular array: ' + JSON.stringify(popularArray));
        // 成功后返回数据
        callback(null, popularArray);
    });
};

/* 获取相关课程推荐 */
Course.getRecommendation = function (condition, callback) {

    var _condition = {
        tagNameArray: condition.tagNameArray,
        tagTypeArray: condition.tagTypeArray,
        count: condition.count || 6
    };
    // 刷选条件
    if( condition.filter ){

        _condition.filter = {
            filterContentType: condition.filter.filterContentType,
            filterContentName: condition.filter.filterContentName
        };
    }

    Tag.getTagContent(_condition, function (err, tagContentArray) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }

        callback(null, tagContentArray);
    });
};

/* 更改课程审查属性 -- 审查通过 */
Course.examine = function (status, con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Course', courseSchema);

    var query = Model.findOne();
    query.where({
        courseName: con.courseName,
        courseType: con.courseType
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        // 文档存在
        if(doc){
            // 已经审查通过了
            if(doc.examine.status == 'pass'){
                console.log('已经审查过了！');
                return callback(null, false);
            }

            var query2 = doc.update({
               $set: {
                   examine: {
                       status: status,
                       examineAccount: con.examineAccount,
                   }
               }
            });

            query2.exec(function (err, doc) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, true)
            });

        }else {
            var error = new Error('文档未找到！');
            callback(error);
        }
    });
};



module.exports = Course;









