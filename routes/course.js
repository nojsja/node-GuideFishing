/**
 * Created by yangw on 2016/11/8.
 * 带渔课程路由管理
 */

/* 课程模型 */
var Course = require('../models/Course');
/* 读取磁盘图片数据形成地址 */
var ReadCourseImg = require('../models/ReadTypeImg');

function course(app){

    // 获取课程主页
    app.get('/course/index', function (req, res) {

        res.render('course_index', {
            title: "课程主页"
        });
    });

    // 获取课程详情介绍页面
    app.get('/course/detail', function (req, res) {
       
        res.render('course_detail', {
            title: "课程详情"
        });
    });
    
    // 获取课程学习页面
    app.get('/course/view', function (req, res) {

        res.render('course_view', {
            title: "课程学习"
        });
    });
    
    // 读取课程列表
    app.post('/course/readCourseList', function (req, res) {

        var condition = {};
        // 课程图片地址
        var typeImgUrl = {};
        var readUrl = '../public/images/courseType/';
        var visitUrl = '/images/courseType/';
        ReadCourseImg(readUrl, visitUrl, function (data) {
            typeImgUrl = data;
        });
        if(req.body.courseName) {
            condition.courseName = req.body.courseName;
        }
        //筛选的读取课程类型
        if(req.body.courseType != "ALL"){
            condition.courseType = req.body.courseType;
        }
        if(req.body.skip){
            condition.skip = req.body.skip;
        }
        if(req.body.limit){
            condition.limit = req.body.limit;
        }
        if(req.body.select){
            condition.select = req.body.select;
        }
        if(req.body.courseTypeArray){
            condition.courseTypeArray = req.body.courseTypeArray;
        }

        console.log("筛选条件: " + JSON.stringify(condition));

        Course.readList(condition, function (err, testArray) {
            if(err) {
                console.log('readCourseList error.');
                return res.json(JSON.stringify({
                    error: err,
                }));
            }
            console.log('readCourseList success.');
            res.json(JSON.stringify({
                courseArray: testArray,
                typeImgUrl: typeImgUrl
            }));
        });
    });

}

module.exports = course;