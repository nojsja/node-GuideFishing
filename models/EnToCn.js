/**
 * Created by yangw on 2017/4/6.
 * 中英文转换映射对象
 */
var Info = require('./Info');

var EnToCn = (function () {

    // 映射模式
    var pattern = {

        testType: {
            "character": "性格测试",
            "personality": "人格测试",
            "emotion": "情感测试",
            "communication": "交际测试",
            "potential": "潜能测试"
        },

        courseType: {
            "jobFound": "求职秘籍",
            "jobSkill": "职场技能",
            "software": "软件技巧",
            "english": "英语进阶",
            "personal": "个人提升",
            "frontEnd": "前端",
            "backEnd": "后台",
            "tool": "工具",
            "industry": "行业",
            "mobile": "移动端",
            "operation": "运维",
            "security": "安全"
        },

        admin: {
            "account": "账户",
            "password": "密码",
            "nickName": "昵称",
            "rank": "权限等级",
            "examineType": "审查权限",
            "examineProgress": "审查进度",
            "examineContent": "审查内容"
        }
    };

    // 从数据库读取数据初始化
    function initPattern(callback) {
        Info.getAllPattern(function (err, _pattern) {

            if(err){
                return callback(err);
            }

            callback(null, _pattern);
        });
    }
    initPattern(function (err, _pattern) {
        if(err){
            return console.log(err);
        }
        // 更新pattern
        pattern.courseType = _pattern.courseType;
    });
    
    // 存储一条数据到数据库
    function updatePattern(info, callback) {

        var newInfo = new Info(info);
        newInfo.save(function (err, isPass) {

            if(err){
                return callback(err);
            }
            initPattern(function (err, _pattern) {

                if(err){
                    return callback(err);
                }
                callback(null, _pattern);;
            })
        });
    }

    // 获取某个映射
    function getPattern(name, type) {

        return pattern[type][name] || "unknown";

    }

    // 设置某个映射
    function setPattern(name, type, value, callback) {

        updatePattern({
            contentType: type,
            pattern: {
                english: name,
                china: value
            }

        }, function (err, _pattern) {

            if(err){
                return callback(err);
            }
            callback(null, _pattern);
        });
    };

    // 获取整个映射
    function getAllPattern(type) {

        return pattern[type] || {};
    }

    // 返回调用接口
    return {
        getPattern: getPattern,
        setPattern: setPattern,
        getAllPattern: getAllPattern
    }
})();

module.exports = EnToCn;
