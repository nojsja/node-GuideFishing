/**
 * Created by yangw on 2017/4/5.
 * Admin 模型
 */

var mongoose = require('./tools/Mongoose');
var adminSchema = require('./db_schema/admin_schema').adminSchema;

// 审查模式
var Examine = require('./Examine');

function Admin(data) {

    this.adminData = {
        account: data.account,
        password: data.password,
        nickName: data.nickName,
        rank: data.rank,
        examineType: data.examineType
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

/* 审查课程和测评 */
Admin.examine = function (status, con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Admin', adminSchema);
    
    Examine.examine(status, con, function (err, isPass) {

        if(err){
            return callback(err);
        }

        // 已经成功执行审查
        if(isPass){
            // 更改admin表中提交申请者的审查情况
            var query = Model.findOne();
            query.where({
                account: con.adminAccount
            });
            query.exec(function (err, doc) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                if(doc){

                    // 存储审查进度
                    function examineProgressSave() {

                        var query2 = doc.update({
                            $push: {
                                examineProgress: {
                                    contentName: con.contentName,
                                    contentType: con.contentType,
                                    examineType: con.examineType,
                                    examineAccount: con.examineAccount,
                                    adminAccount: con.adminAccount,
                                    status: con.status,
                                    date: con.date,
                                    examineText: con.examineText
                                }
                            }
                        });
                        query2.exec(function (err, doc) {

                            if(err){
                                console.log(err);
                                return callback(err);
                            }
                            // 成功更新
                            callback(null, true);
                        });
                    }

                    // 更新审查进度
                    function examineProgressUpdate() {

                        var examineProgress = doc.examineProgress;
                        var updateProgress = [];
                        for(let i = 0; i < examineProgress.length; i++){

                            updateProgress.push(examineProgress[i]);

                            if(examineProgress[i].contentName == con.contentName &&
                                examineProgress[i].contentType == con.contentType){

                                updateProgress[i].examineAccount = con.examineAccount;
                                updateProgress[i].status = con.status;
                                updateProgress[i].date = con.date;
                                updateProgress[i].examineText = con.examineText;
                            }
                        }
                        var query2 = doc.update({
                            $set: {
                                examineProgress: updateProgress
                            }
                        });
                        query2.exec(function (err, doc) {

                            if(err){
                                console.log(err);
                                return callback(err);
                            }
                            // 成功更新
                            callback(null, true);
                        });
                    }

                    // 更新进度信息
                    if(status == 'isExaming'){

                        examineProgressSave();
                    }else {
                        examineProgressUpdate();
                    }
                }
            });

        }else {

            callback(null, false);
        }

    });

};

/* 获取需要审查的数据course and test */
Admin.getExamineData = function (con, callback) {

    Examine.get(con, function (err, examineData) {

        if(err){
            return callback(err);
        }
        callback(null, examineData);
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

            // 返回审查数据
            callback(null, doc.examineProgress);
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

    // 所有查询操作
    var queryAction  = ["condition", "filter", "select", "limit"];
    // 所有默认可选属性
    var select = ["account", "nickName", "password", "rank", "examineType"];

    var query = Model.find();

    console.log(con);
    // 确定查询条件
    for(let item in con){

        if(con[item]){
            // 属性存在
            let index = queryAction.indexOf(item);
            if(index >= 0){

                if(item == "filter"){

                    continue;
                }
                if(item == "select"){

                    // 覆写select
                    select = [];
                    for(let j in con[item]){
                        select.push(j);
                    }
                    query.select(con[item]);
                    continue;
                }

                if(item == "limit"){
                    query.limit(con[item]);
                    continue;
                }

                if(item == "condition"){
                    query.where(con[item]);
                }

            }
        }

    }

    // 执行查询
    query.exec(function (err, docs) {

        if(err){
            console.log('[error: ]: ' + err);
            return callback(err);
        }
        if(docs && docs.length > 0){

            var adminArray = [];
            for(let i = 0; i < docs.length; i++){

                var data = {};
                select.forEach(function (item) {
                    data[item] = docs[i][item];
                });
                adminArray.push(data);
            }
            // 成功后返回所有管理员的信息（除了自己）
            callback(null, adminArray, select);
        }else {
            callback(null, [], select);
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
        allAttributes: {
            'account': '账户',
            'password': '密码',
            'rank': '权限级别',
            'examineType': '审查类型',
            'nickName': '昵称'
        },
        searchableAttributes: {
            'rank': '权限级别',
            'examineType': '审查类型'
        },
        changeableAttributes: {
            'password': '密码',
            'rank': '权限级别',
            'examineType': '审查类型',
            'nickName': '昵称'
        },
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
                $set: {
                    rank: con.rank,
                    examineType: con.examineType,
                    examineContent: [],
                    password: con.password,
                    nickName: con.nickName
                }
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