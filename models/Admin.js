/**
 * Created by yangw on 2017/4/5.
 * Admin 模型
 */

var mongoose = require('./tools/Mongoose');
var adminSchema = require('./db_schema/admin_schema').adminSchema;
// 课程模式
var Course = require('./Course');
// 测评模式
var Test = require('./AllTest');

function Admin(data) {

    this.adminData = {
        account: data.account,
        password: data.password,
        nickName: data.nickName,
        rank: data.rank,
        examineType: data.examineType,
        examineContent: {
            course: [],
            test: []
        }
    };
}

/* 存储一个用户数据 */
Admin.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);
    // 账户
    var account = this.adminData.account;
    var adminData = this.adminData;

    // 检查用户是否已经存在
    Admin.userCheck({account: account}, function (err, isExit) {

        if(err){
            console.log('[error]管理员查询出错：' + err);
            return callback(err);
        }

        if(isExit){
            callback(null, false);
        }else {
            // 存储用户数据
            var newAdmin = new Model(adminData);
            newAdmin.save(function (err, doc) {
                if(err){
                    console.log('[error]管理员存储出错：' + err);
                    return callback(err);
                }
                console.log('管理员信息成功存储！');
                callback(null, true);
            });
        }
    });

};

/* 验证用户是否存在 */
Admin.userCheck = function (condition, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var query = Model.findOne();
    query.where(condition);
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]验证出错：' + err);
            return callback(err);
        }
        if(doc){
            console.log('[tips]用户已经存在！');
            callback(null, true);
        }else {
            callback(null, false);
        }
    });
};

/* 管理员登录 */
Admin.signin = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var condition = {
        account: con.account || null,
        password: con.password || null
    };

    var query = Model.findOne();
    query.where(condition);

    query.exec(function (err, doc) {
        if(err){
            console.log('[error]管理员登录出错！');
            return callback(err);
        }
        if(doc){
            // 登录成功,返回管理员权限信息
            callback(null, true, {
                nickName: doc.nickName,
                examine: {
                    rank: doc.rank,
                    examineType: doc.examineType
                }
            });
        }else {
            // 登录失败
            callback(null, false);
        }
    });
};

/* 审查通过课程和测评 */
Admin.examinePass = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

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
            courseName: con.name,
            courseType: con.type,
            adminAccount: con.adminAccount
        },
        test: {
            testTitle: con.name,
            testType: con.type,
            adminAccount: con.adminAccount
        }
    };

    // 函数调用
    examineData.examineAction[examineType]
        .examinePass(examineData[examineType], function (err, isPass) {

            if(err){
                return callback(err);
            }
            // 已经被当前管理员进行审查
            if(isPass){
                // 删除遗留在1级管理员中的数据
                var query = Model.find();
                query.where({
                    rank: 1,
                    examineType: con.examineType
                });
                query.exec(function (err, docs) {

                    if(err){
                        console.log('[error]: ' + err);
                        return callback(err);
                    }
                    if(docs && docs.length > 0){
                        for(let i = 0; i < docs.length; i++){

                            var examineContent = docs[i][con.examineType];
                            for(let j = 0; j < examineContent.length; j++){
                                if( examineContent[j] [examineData.examineName[con.examineType] ] == con.name &&
                                    examineContent[j] [examineData.examineType[con.examineType] ] == con.type ){

                                    // 删除一个数据
                                    examineContent.splice(j, 1);
                                }

                            }

                        }

                        // 审查成功
                        callback(null, true);
                    }else {
                        // 审查无效
                        callback(null, false);
                    }
                });
            }else {
                // 当前审查无效
                callback(null, false);
            }
        });

};

/* 获取需要审查的数据course and test */
Admin.getExamineData = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var query = Model.findOne();
    query.where({
        account: con.account
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        if(doc){
            var examineType = doc.examineType;
            // 返回审查数据
            callback(null, doc.examineContent[examineType]);
        }else{
            var error = new Error('查询信息有误！');
            callback(error);
        }
    });
};

/* 获取审核进度 */
Admin.getExamineProgress = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var query = Model.findOne();
    query.where({
        account: con.account
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        if(doc){
            var examineType = doc.examineType;
            // 返回审查数据
            callback(null, doc.examineProgress[examineType]);
        }else{
            var error = new Error('查询信息有误！');
            callback(error);
        }
    });
};

/* 大管理员获取所有管理员 */
Admin.getAdministrator = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var query = Model.find();
    query.where({
        account: {$not: con.account}
    });
    query.exec(function (err, docs) {

        if(err){
            console.log('[error: ]: ' + err);
            return callback(err);
        }
        if(docs && docs.length > 0){
            var adminArray = [];
            for(let i = 0; i < docs.length; i++){

                adminArray.push({
                    account: docs[i].account,
                    password: docs[i].password,
                    nickName: docs[i].nickName,
                    examineType: docs[i].examineType,
                    rank: docs[i].rank
                });
            }
            // 成功后返回所有管理员的信息（除了自己）
            callback(null, adminArray);
        }else {
            callback(null, []);
        }
    });
};

/* 获取权限管理约束
 *
 * 用于新建和分配权限
 * allAttributes -- 创建所需的所有属性
 * searchableAttributes -- 可被搜索的属性
 * changeableAttributes -- 可被改变的属性
 * rank -- 所有子级别
 * examineType -- 所有子审查类型
  * */
Admin.getPermissionConstraints = function (callback) {

    callback({
        allAttributes: ['account', 'password', 'rank', 'examineType', 'nickName'],
        searchableAttributes: ['rank', 'examineType'],
        changeableAttributes: ['password', 'rank', 'examineType', 'nickName'],
        rank: [0, 1, 2],
        examineType: ['course', 'test']
    });
};

/* 大管理员（0级）修改和分配权限 */
Admin.permissionAssign = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var query = Model.findOne();
    query.where({
       account: con.account
    });
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        if(doc){

            var query2 = doc.update({
                $set: { rank: con.rank, examineType: con.examineType, examineContent: {course: [], test: []} }
            });
            query2.exec(function (err, results) {
                if(err){
                    console.log('[error]: ' + err);
                    return callback(err);
                }
                // 更新成功
                callback(null, true);
            })
        }else {
            // 更改失败
            callback(null, false);
        }

    });
};

/* 大管理员（0级）删除1,2级管理员 */
Admin.removePermission = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);

    var condition = {
        account: con.account
    };

    var query = Model.findOne();
    query.where(condition);
    query.exec(function (err, doc) {

        if(err){
            console.log('[error]: ' + err);
            return callback(err);
        }
        if(doc){
            doc.remove(function (err, doc) {

                if(err){
                    console.log('[error]: ' + err);
                    return callback(err);
                }
                // 执行删除成功
                callback(null, true);
            });
        }else {
            callback(null, false);
        }
    });
};

module.exports = Admin;