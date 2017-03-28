/**
 * Created by yangw on 2017/2/20.
 * 用户登录系统模式
 */

var mongoose = require('./tools/Mongoose.js');
var userSchema = require('./db_schema/user_schema').userSchema;

function User(info) {

    // 即将存储的数据
    this.userData = {
        account: info.account || '--broke--',
        password: info.password || '--broke--',
        nickName: info.nickName || '--broke--',
        root: info.root || false,
        purchasedItem: []
    };
}

/* 存储一个用户数据 */
User.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('User', userSchema);
    // 账户
    var account = this.userData.account;
    var userData = this.userData;

    // 检查用户是否已经存在
    User.userCheck({account: account}, function (err, isExit) {

        console.log('check');
        if(err){
            console.log('[error]用户查询出错：' + err);
            return callback(err);
        }

        if(isExit){
            callback(null, false);
        }else {
            // 存储用户数据
            var newUser = new Model(userData);
            newUser.save(function (err, doc) {
                if(err){
                    console.log('[error]用户存储出错：' + err);
                    return callback(err);
                }
                console.log('用户信息成功存储！');
                callback(null, true);
            });
        }
    });

};

/* 验证用户是否存在 */
User.userCheck = function (condition, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('user', userSchema);

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

/* 用户登录 */
User.signin  = function (con, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('user', userSchema);

    var condition = {
        account: con.account || null,
        password: con.password || null
    };

    var query = Model.findOne();
    query.where(condition);

    query.exec(function (err, doc) {
        if(err){
            console.log('[error]用户登录出错！');
            return callback(err);
        }
        if(doc){
            // 登录成功
            callback(null, true, { nickName: doc.nickName });
        }else {
            // 登录失败
            callback(null, false);
        }
    });
};

/* 存储一条购买记录 */
User.purchase = function (condition,callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('user', userSchema);

    var query = Model.findOne();
    query.where({
        account: condition.account
    });

    query.exec(function (err, doc) {

        if(err){
            console.log('[error]购买存储出错！');
            return callback(err);
        }
        if(doc){
            var updateAction = {
                    $push: {purchasedItem: condition.data}
            };

            doc.update(updateAction).exec(function (err, doc) {

                if(err){
                    console.log('[error]购买存储出错！');
                    return callback(err);
                }
                // 购买信息存储成功
                callback(null, true);
            });
        }else {
            var error = new Error('用户信息有误！');
            callback(error);
        }
    });
};

/* 验证购买记录 */
User.purchaseCheck = function (condition, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('user', userSchema);
    
    var query = Model.findOne();
    query.where({
       account: condition.account
    });
    query.exec(function (err, doc) {
        if(err){
            console.log('[error]验证购买出错！');
            return callback(err);
        }
        if(doc){

            var item;
            for(let index in doc.purchasedItem){
                item = doc.purchasedItem[index];
                if(item.itemName == condition.data.itemName &&
                    item.itemType == condition.data.itemType){
                    // 已经购买
                    return callback(null, true);
                }
                if(index == doc.purchasedItem.length - 1){
                    callback(null, false);
                }
            }

        }else{
            var error = new Error('用户信息有误！');
            callback(error);
        }
    });

};

/* 获取个人信息 */
User.getSelfinfo = function (condition, callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('user', userSchema);

    var query = Model.findOne();
    query.where({
       account:  condition.account
    });
    
    query.exec(function (err, doc) {
        if(err){
            console.log('[error]获取购买信息出错！');
            return callback(err);
        }
        // 成功返回数据
        if(doc){

            if(condition.select){
                // 要求筛选的数据
                var select = {};
                for(let i = 0; i < condition.select.length; i++){

                    if( doc[condition.select[i]] ){
                        select[ condition.select[i] ] = doc[condition.select[i]];
                    }
                }

                // 返回数据
                callback(false, select);
            }else {

                console.log(doc.purchasedItem);

                // 默认返回的数据
                callback(false, {
                    account: doc.account,
                    nickName: doc.nickName,
                    password: doc.password,
                    root: doc.root,
                    purchasedItem: doc.purchasedItem
                });
            }

        }
    });
};

module.exports = User;
