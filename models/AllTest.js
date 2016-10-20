/**
 * Created by yangw on 2016/10/19.
 * 与评测题目操作相关的数据模型,
 * 比如评测题目的录入,查找,删除,更新等等
 */

var mongoose = require('mongoose');
var testSchema = require('./test_schema.js').testSchema;

/* 构造函数 */
function AllTest(testGroup) {
    //一组题目
    this.testGroup = testGroup;
}

/* 存储一组题目数据 */
AllTest.prototype.save = function (callback) {
    var testGroup = this.testGroup;
    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);

    console.log('before open.');
    //连接打开后
    mongoose.connection.once('open', function () {
        console.log('open');
        var newTestMode = new Tests(testGroup);
        newTestMode.save(function (err, doc) {
            if(err) {
                console.log(err);
                mongoose.disconnect();
                return callback(true);
            }
            mongoose.disconnect();
            callback(false);
        });
    });
};

/* 读取一组题目的详细信息 */
AllTest.getDetail = function (docCondition, callback) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);
    mongoose.connection.once('open', function () {

        var query = Tests.findOne();
        query.where(docCondition);
        query.exec(function (err, doc) {
            if(err) {
                mongoose.disconnect();
                return callback(err);
            }
            //成功返回
            mongoose.disconnect();
            callback(null, doc);
        });
    });
};

/* 读取文档列表 */
AllTest.readTestList = function (docCondition, callback) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);
    mongoose.connection.once('open', function () {

        //需要读取的文档的查询条件
        var condition = {};
        /* 读取条目数量 */
        var number = 15;
        /* 跳过读取的条目数量 */
        var skipNum = 0;
        /* 需要发送给客户端的对象数组 */
        var testArray = [];

        /* 进行条件判断 */
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

        var query = Tests.find().where(condition);
        query.limit(number);
        query.skip(skipNum);
        //执行查询
        query.exec(function (err, docs) {
            if(err){
                mongoose.disconnect();
                return callback(err);
            }
            for(var i in docs) {
                testArray.push(docs[i]);
            }
            //返回对象数组
            callback(null, testArray);
        });

    });
};

/* 删除一个文档 */
AllTest.deleteOneDoc = function (docCondition, callback) {

    //要删除文档的判断条件
    var condition = docCondition;
    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);
    mongoose.connection.once('open', function () {
        //query是返回的Document对象,注意和Model对象相区别
        var query = Tests.findOne().where({
            testType: condition.testType,
            testTitle: condition.testTitle
        });
        //提交操作
        query.exec(function (err, doc) {
            if(err){
                mongoose.disconnect();
                return callback(err);
            }
           console.log('Before delete.');
            doc.remove(function (err, deleteDoc) {
                if(err){
                    mongoose.disconnect();
                    return callback(err);
                }
                //成功删除
                console.log('delet one doc error!');
                mongoose.disconnect();
                callback(null);
            })
        });
    });

};

/* 删除多个文档 */
AllTest.deleteSomeDoc = function (docsCondition, callback) {

    //多个判断依据
    var condition = docsCondition;
    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);
    mongoose.connection.once('open', function () {
        var query = Tests.remove();
        //删除条件
        query.where(condition);
        query.exec(function (err, results) {
            if(err){
                mongoose.disconnect();
                return callback(err);
            }
            //成功删除
            console.log('%d Documents deleted.', results);
            mongoose.disconnect();
            callback(null);
        })
    });
}

module.exports = AllTest;