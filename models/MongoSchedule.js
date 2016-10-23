/**
 * Created by yangw on 2016/10/19.
 * 定时执行的mongodb数据库脚本
 */

/*
* 数据库定时执行的方法
* 在每日按凌晨零点更新popular表,
* popular表中存储tests表中最受欢迎
* 的各个类型评测题目各5组
* */

/* 引入数据库模式 */
var mongoose = require('mongoose');
var popularSchema = require('./popular_schema.js').popularSchema;
var testSchema = require('./test_schema.js').testSchema;
//所有筛选条件
var searchCondition = {
    testTypeArray: ['character', 'personality', 'emotion', 'communication', 'potential'],
    limit: 5,
};

function MongoSchedule() {
    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = new testSchema('Tests', testSchema);
    mongoose.connection.once('open', function () {

        getPopularArray(function (popularArray) {
            //未读取到数据则返回
            if(popularArray.length == 0) {
                return;
            }
            //将读取到的数据存入另一个popular表中
            var Popular = new popularSchema("Popular", popularSchema);
            mongoose.connection.once('open', function () {
                // 遍历所有数组的的pupular item存入popular表
                Popular.create(popularArray, function (err) {
                    if(err){
                        console.log("MongoSchedule error: " + err);
                    }
                    mongoose.disconnect();
                });
            });
        });
        
        //存储读取到的各个评测类型最受欢迎的前5道评测题目
        function getPopularArray(callback) {
            var popularArray = [];
            for(var index in searchCondition.testTypeArray){
                //查询条件
                var query = Tests.find({
                    testType: searchCondition.testTypeArray[index]
                });
                query.limit(searchCondition.limit);
                query.sort({frequency: -1});
                //筛选数据
                query.select({
                    testType: 1,
                    testTitle: 1
                });
                query.exec(function (err, docs) {
                    if(err){
                        console.log('MongoSchedule error: ' + err);
                        mongoose.disconnect();
                        callback([]);
                    }
                    for(var doc in docs){
                        popularArray.push(doc);
                    }
                    //先关闭当前在tests表中的连接
                    mongoose.disconnect();
                    callback(popularArray);
                });
            }
        };
    });
}

module.exports = MongoSchedule;