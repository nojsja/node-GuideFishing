/**
 * Created by yangw on 2016/10/19.
 * 定时执行的mongodb数据库脚本
 */

/*
* 数据库定时执行的方法
* 在每日按凌晨零点更新popular_course表
* 和popular_test表,各自筛选10条数据,
* */

/* 引入数据库模式 */
var Course = require('./Course');
var AllTest = require('./AllTest');

function MongoSchedule() {

    // 更新热门课程
    Course.updatePopular(function (err) {
        // 错误
        if(err){
            console.log('[MongoSchedule error]: ' + err);
        }
    });

    // 更新热门评测
    AllTest.updatePopular(function (err) {

        // 错误
        if(err){
            console.log('[MongoSchedule error]: ' + err);
        }
    });
}

module.exports = MongoSchedule;