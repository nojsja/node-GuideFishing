/**
 * Created by yangw on 2016/10/19.
 * 与评测题目操作相关的数据模型,
 * 比如评测题目的录入,查找,删除,更新等等
 */

var mongoose = require('./tools/Mongoose');
var getDate = require('./tools/GetDate');
// 测试模式
var testSchema = require('./db_schema/test_schema.js').testSchema;
// 受欢迎的测试模式
var popularTestSchema = require('./db_schema/popularTest_schema').popularTestSchema;
// Tag 模型
var Tag = require('./Tag');
// Admin 模型
var Admin = require('./Admin');
// promise 控制流程
var Q = require('q');

/* 构造函数 */
function AllTest(testGroup) {
    //一组题目
    this.testGroup = testGroup;

    // 课程标签(数组)
    if(testGroup.testTags instanceof Array){

        // 创建新数组的迭代器方法
        this.tagArray = testGroup.testTags.map(function (item) {

            return {
                tagName: item,
                tagType: "test",
                contentName: testGroup.testTitle,
                contentType: testGroup.testType
            }
        });
    }else {
        this.tagArray = [];
    }
}

/* 存储一组题目数据 */
AllTest.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);
    var Q = require('q');

    // 课程数据
    var testGroup = this.testGroup;
    // 标签数据
    var tagArray = this.tagArray;

    // 需要记录的审查数据
    var examineData = {
        contentName: this.testGroup.testTitle,
        contentType: this.testGroup.testType,
        examineType: "test",
        examineText: null,
        adminAccount: this.testGroup.examine.adminAccount,
        examineAccount: null,
        status: "isExaming",
        date: getDate()
    };

    // 删除以前的数据
    AllTest.deleteIfExit({
        testTitle: testGroup.testTitle,
        testType: testGroup.testType
    }, function (err) {

        if(err){
            console.log(err);
            return callback(err);
        }

        var newTestMode = new Test(testGroup);
        newTestMode.save(function (err, doc) {
            if(err) {
                console.log(err);
                return callback(true);
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

                    console.log('test save done.');
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
AllTest.deleteIfExit = function (condition, callback) {

    var db = mongoose.connection;
    var Course = mongoose.model('Test', testSchema);

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

/* 获取当前直播课程的数据 */
AllTest.getLoadData = function (condition, callback) {

    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    var query = Test.findOne().where({
        testTitle: condition.testTitle,
        testType: condition.testType
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

/* 更新测评数据 */
AllTest.update = function (condition, callback) {

    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    // 筛选的课程名
    var testTitle = condition.testTitle;
    // 所有可以更新的字段
    var allSegment = ['testType', 'testTitle', 'scoreMode', 'scoreValue',
        'abstract', 'clickRate', 'scoreSection', 'categorySection'];

    var query = Test.findOne().where({
        testTitle: testTitle
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

/* 读取一组题目的信息 */
AllTest.getDetail = function (docCondition, callback) {

    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    var query = Test.findOne();
    if(docCondition.select){
        query.select(docCondition.select);
    }
    query.where(docCondition.condition);

    query.exec(function (err, doc) {
        if(err) {
            return callback(err);
        }
        //成功返回
        callback(null, doc);
    });
};

/* 读取文档列表
* 需要展示在列表的信息包括:
* testTitle, tesetType, abstract, date*/
AllTest.readList = function (docCondition, callback) {

    // defer 要放在局部范围内, 不然会变成全局变量
    var defer = Q.defer();
    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

        //需要读取的文档的查询条件
        var condition = {};
        /* 读取条目数量 */
        var number = 20;
        /* 跳过读取的条目数量 */
        var skipNum = 0;
        /*** 需要发送给客户端的对象数组 ***/
        var testArray = [];
        /* 测试类型数组 */
        var testTypeArray = [];
        /* 默认选择的数据项 */
        var select = {
            testTitle: 1,
            testType: 1,
            abstract: 1,
            date: 1
        };

        /* 进行条件判断客户端的筛选需求 */
        for(var con in docCondition) {
            console.log(con + 1 + JSON.stringify(docCondition[con]));
            if(con == "limit") {
                number = docCondition[con];
            }else if(con == "skip") {
                skipNum = docCondition[con];
            }else if(con == "select"){
                select = docCondition[con];
            }else if(con == "testTypeArray"){
                testTypeArray = docCondition[con];
            } else {
                //复制属性
                condition[con] = docCondition[con];
            }
        }

        // 控制流程
        defer.promise

            .then(function (info) {

                return info;

            })
            .then(function (info) {

                Test.count({}, function (err, count) {

                    if(err){
                        console.log(err);
                        return callback(err);
                    }
                    // 大于等于则直接返回
                    if(info.skipNum >= count){
                        return callback(null, info.testArray);
                    }

                    console.log('limit: ' + info.number);
                    console.log('skip: ' + info.skipNum);
                    console.log('select: ' + JSON.stringify(info.select));
                    console.log('query condition: ' + JSON.stringify(info.condition));

                    var query = Test.find().where(info.condition);
                    // 不读正在审查的数据
                    query.ne('examine.status', 'isExaming');
                    // query.ne('examine.status', 'reject');

                    if(info.testTypeArray.length > 0){
                        query.in('testType', info.testTypeArray);
                    }
                    query.limit(info.number);
                    //定制选择读取的类型
                    query.select(info.select);
                    // 跳过数量不能超出,否则会报错
                    query.skip(info.skipNum);
                    query.sort({date: -1});
                    //执行查询
                    query.exec(function (err, docs) {

                        if(err){
                            console.log(err);
                            return callback(err);
                        }
                        for(var i in docs) {
                            info.testArray.push(docs[i]);
                        }
                        //返回对象数组
                        callback(null, info.testArray);
                    });

                });

            }).done();

        // 开始有序化处理
        defer.resolve({
            number: number,
            skipNum: skipNum,
            select: select,
            condition: condition,
            testArray: testArray,
            testTypeArray: testTypeArray
        });

};


/* 受欢迎的课程数据更新和获取 */
AllTest.updatePopular = function (callback) {

    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);
    var PopularTest = mongoose.model('popular_test', popularTestSchema);

    // 筛选条件
    var condition = {
        select: {
            testTitle: 1,
            testType: 1
        },
        limit: 3,
        sort: {
            clickRate: -1
        }
    };
    var queryTest = Test.find().where({});
    // 设置筛选
    queryTest.select(condition.select)
        .limit(condition.limit)
        .sort(condition.sort);

    // 执行
    queryTest.exec(function (err, docs) {

        if(err){
            console.log('[updatePopular error]:' + err);
            return callback(err);
        }
        // 存储课程数据的数组
        var popularData = [];
        for(let index in docs){
            popularData.push({
                testTitle: docs[index].testTitle,
                testType: docs[index].testType
            });
        }
        // 存储数据
        popularSave(popularData);
    });

    // 存储获取到的数据
    function popularSave(popularArray) {

        // 删除以前的数据
        var query = PopularTest.remove();
        query.exec(function (err, results) {

            if(err){
                console.log("[popularSave error]: " + err);
                return callback(err);
            }

            // 遍历存储数据
            for(let index in popularArray){

                let popularModel = new PopularTest(popularArray[index]);
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

// 获取热门课程数据
AllTest.getPopular = function (callback) {

    var db = mongoose.connection;
    var PopularTest = mongoose.model('popular_test', popularTestSchema);

    var query = PopularTest.find().where({});
    query.exec(function (err, docs) {

        if(err){
            console.log('[getPopular error]: ' + err);
            return callback(err);
        }
        var popularArray  = [];
        for (let index in docs){
            popularArray.push({
                testTitle: docs[index].testTitle,
                testType: docs[index].testType
            });
        }
        // 成功后返回数据
        callback(null, popularArray);
    });
};

/* 删除一个文档 */
AllTest.deleteOneDoc = function (docCondition, callback) {

    //多个判断依据
    var condition = docCondition;
    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    var query = Test.findOne().where(condition);
    query.exec(function (err, doc) {
        if(err){
            return callback(err);
        }
        doc.remove(function (err, deleteDoc) {
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    });

};

/* 删除多个文档 */
AllTest.deleteSomeDoc = function (docsCondition, callback) {

    //多个判断依据
    var condition = docsCondition;
    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    var query = Test.remove();
    //删除条件
    query.where(condition);
    query.exec(function (err, results) {

        if(err){
            return callback(err);
        }
        //成功删除
        console.log('%d Documents deleted.', results);
        callback(null);
    });

};

/* 更改测评审查属性 -- 审查通过 */
AllTest.examine = function (status, con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Test', testSchema);

    var query = Model.findOne();
    query.where({
        testTitle: con.testTitle,
        testType: con.testType
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        // 文档存在
        if(doc){
            // 已经审查通过了
            if(doc.examine.status == "pass" ){
                console.log('已经审查过了！');
                return callback(null, false);
            }
            var query2 = doc.update({
                $set: {
                    examine: {
                        adminAccount: con.adminAccount,
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

/* 弹幕存储 */
AllTest.danmuSave = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Test', testSchema);

    // 可存储的属性
    var selectAttr = ['color', 'text', 'user', 'date'];
    var danmuData = {};

    selectAttr.forEach(function (attr) {

        if(con.danmu[attr]){
            danmuData[attr] = con.danmu[attr];
        }
    });

    var query = Model.findOne();
    query.where({
        testTitle: con.testTitle,
        testType: con.testType
    });

    query.exec(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        if(doc){

            query = doc.update({
                $push: {
                    danmu: danmuData
                }
            });
            query.exec(function (err) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, true);
            });
        }else {
            callback(null, null);
        }
    });
};

/* 弹幕读取 */
AllTest.danmuRead = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Test', testSchema);

    var query = Model.findOne();
    query.where({
        testTitle: con.testTitle,
        testType: con.testType
    });
    query.select({
        danmu: 1
    });

    query.exec(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        if(doc){

            callback(null, doc.danmu);

        }else {
            callback(null, null);
        }
    });

};


module.exports = AllTest;