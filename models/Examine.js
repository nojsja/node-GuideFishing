/**
 * Created by yangw on 2017/4/18.
 * 审查模型
 */

var mongoose = require('./tools/Mongoose');
var examineSchema = require('./db_schema/examine_schema').examineSchema;
// 获取当前日期
var getDate = require('./tools/GetDate');
// Course模式和Test模式
var Course = require('./Course');
var Test = require('./AllTest');


function Examine(examineData) {

    this.examineData = {
        contentName: examineData.contentName,
        contentType: examineData.contentType,
        status: 'isExaming',
        examineType: examineData.examineType,
        examineAccount: null,
        examineText: null,
        adminAccount: examineData.adminAccount,
        date: getDate()
    };
}

/* 存储审查数据 */
Examine.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Examine', examineSchema);

    var newExamine = new Model(this.examineData);
    newExamine.save(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        callback(null);
    });
};

/* 删除审查数据 */
Examine.deleteOne = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Examine', examineSchema);

    var condition = {
        contentName: con.contentName,
        contentType: con.contentType
    };

    var query = Model.findOne();
    query.where(condition);
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        if(doc){
            doc.remove(function (err, result) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, true);
            });

        }else {
            callback(null, false);
        }
    });

};

/* 审查 */
Examine.examine = function (status, con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Examine', examineSchema);

    // 审查类型Course 和 Test
    var examineType = con.examineType;
    // 审查调用映射
    var examineData = {
        examineName: {
            test: "testTitle",
            course: "courseName"
        },
        examineType: {
            test: "testType",
            course: "courseType"
        },
        examineAction: {
            course: Course,
            test: Test
        },
        course: {
            courseName: con.contentName,
            courseType: con.contentType,
            examineAccount: con.examineAccount,
        },
        test: {
            testTitle: con.contentName,
            testType: con.contentType,
            examineAccount: con.examineAccount,
        }
    };

    // 函数调用
    examineData.examineAction[examineType]
        .examine(status, examineData[examineType], function (err, isPass) {

            if(err){
                return callback(err);
            }

            var query = Model.findOne();
            query.where(examineData[examineType]);
            query.exec(function (err, doc) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                if(doc){
                    var query2 = doc.update({
                       $set: {
                           contentName: con.contentName,
                           contentType: con.contentType,
                           examineType: con.examineType,
                           examineText: con.examineText,
                           adminAccount: con.adminAccount,
                           examineAccount: con.examineAccount,
                           status: con.status,
                           date: con.date
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

                    // 更新失败
                    callback(null, false);
                }
            });
        });
};

/* 获取指定的审查数据 */
Examine.get = function (con, callback) {

};

module.exports = Examine;
