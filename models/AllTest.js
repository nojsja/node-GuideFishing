/**
 * Created by yangw on 2016/10/19.
 * 与评测题目操作相关的数据模型,
 * 比如评测题目的录入,查找,删除,更新等等
 */

var mongoose = require('./tools/Mongoose');
var testSchema = require('./db_schema/test_schema.js').testSchema;

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
    var Tests = mongoose.model('Tests', testSchema);

    var newTestMode = new Tests(testGroup);
    newTestMode.save(function (err, doc) {
        if(err) {
            console.log(err);
            return callback(true);
        }
        callback(false);
    });
};

/* 读取一组题目的信息 */
AllTest.getDetail = function (docCondition, callback) {

    var db = mongoose.connection;
    var Tests = mongoose.model('Tests', testSchema);

    var query = Tests.findOne();
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
    var Tests = mongoose.model('Tests', testSchema);

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
            console.log(con);
            if(con == "limit") {
                number = docCondition[con];
            }else if(con == "skip") {
                skipNum = docCondition[con];
            }else if(con == "select"){
                select = docCondition[con];
            }else if(con == "testTypeArray"){
                testTypeArray = docCondition[con];
            }
            else {
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

                Tests.count({}, function (err, count) {
                    if(err){
                        console.log(err);
                        return callback(err);
                    }
                    console.log('defer 1 count:　' + count);
                    // 大于等于则直接返回
                    if(info.skipNum >= count){
                        return callback(null, info.testArray);
                    }

                    console.log('limit: ' + info.number);
                    console.log('skip: ' + info.skipNum);
                    console.log('select: ' + JSON.stringify(info.select));
                    console.log('query condition: ' + JSON.stringify(info.condition));

                    var query = Tests.find().where(info.condition);
                    if(info.testTypeArray.length > 0){
                        console.log(info.testArray.length);
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
                            return callback(err);
                        }
                        for(var i in docs) {
                            info.testArray.push(docs[i]);
                        }
                        console.log('length: ' + info.testArray.length);
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

/* 删除一个文档 */
AllTest.deleteOneDoc = function (docCondition, callback) {

    //多个判断依据
    var condition = docCondition;
    var db = mongoose.connection;
    var Tests = mongoose.model('Tests', testSchema);

    var query = Tests.findOne().where(condition);
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
    var Tests = mongoose.model('Tests', testSchema);

    var query = Tests.remove();
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

}

module.exports = AllTest;