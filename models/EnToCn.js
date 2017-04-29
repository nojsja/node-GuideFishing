/**
 * Created by yangw on 2017/4/6.
 * 中英文转换映射对象
 */

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
            "personal": "个人提升"
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

    // 获取某个映射
    function getPattern(name, type) {

        return pattern[type][name] || "unknown";

    }

    // 设置某个映射
    function setPattern(name, type, value) {

        // 没有这个属性
        if(!pattern[type][name]){
            pattern[type] = {};
            pattern[type][name] = value;
        }

        pattern[type][name] = value;
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
