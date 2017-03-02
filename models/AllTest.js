/**
 * Created by yangw on 2016/10/19.
 * 与评测题目操作相关的数据模型,
 * 比如评测题目的录入,查找,删除,更新等等
 */

var mongoose = require('./tools/Mongoose');
// 测试模式
var testSchema = require('./db_schema/test_schema.js').testSchema;
// 受欢迎的测试模式
var popularTestSchema = require('./db_schema/popularTest_schema').popularTestSchema;

/* promise 控制流程 */
var Q = require('q');

/* 构造函数 */
function AllTest(testGroup) {
    //一组题目
    this.testGroup = testGroup;
}

/* 存储一组题目数据 */
AllTest.prototype.save = function (callback) {

    var testGroup = this.testGroup;
    var db = mongoose.connection;
    var Test = mongoose.model('Test', testSchema);

    var newTestMode = new Test(testGroup);
    newTestMode.save(function (err, doc) {
        if(err) {
            console.log(err);
            return callback(true);
        }
        callback(false);
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
    query.where(docCondition);
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

module.exports = AllTest;