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

module.exports = AllTest;