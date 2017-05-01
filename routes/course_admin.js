/**
 * Created by yangw on 2016/11/8.
 * 课程后台管理页面
 */

// 文件上传
var UploadAction = require('../models/CourseUploadAction');
// 文件存储
var UploadData = require('../models/CourseUploadData');
// 存储课程
var Course = require('../models/Course');
// 获取当前时间
var getDate = require('../models/tools/GetDate');
// 发布直播课程数据
var CourseBroadcastData = require('../models/CourseBroadcastData');
// 权限验证中间件
var permissionCheck = require('../models/permissionCheck').permissionCheck;
// 中英文切换
var EntoCn = require('../models/EnToCn');

function course_admin(app) {
    
    // 进入所有课程管理后台
    app.get('/course/admin/manager', function (req, res, next) {

        permissionCheck.rank1(req, res, next);

    }, function (req, res) {

        res.render('course_adminManager', {
            title: "课程管理"
        });
    });

    // 进入课程编辑后台
    app.get('/course/admin/edit', function (req, res, next) {

        permissionCheck.rank2(req, res, next);

    }, function (req, res) {

        res.render('course_adminEdit', {
            title: "课程编辑",
            loadData: false,
            pattern: EntoCn.getAllPattern('courseType')
        });
    });

    // 编辑已有课程数据
    app.get('/course/admin/edit/:courseType/:courseName', function (req, res, next) {

        permissionCheck.rank2(req, res, next);

    }, function (req, res) {

        var loadData = JSON.stringify({
            courseType: req.params.courseType,
            courseName: req.params.courseName
        });

        res.render('course_adminEdit', {
            title: "课程编辑",
            loadData: loadData,
            pattern: EntoCn.getAllPattern('courseType')
        });
    });

    // 添加课程类型和对应中文
    app.post('/course/courseType/add', function (req, res) {

        var english = req.body.courseType.english;
        var china = req.body.courseType.china;
        var contentType = 'courseType';

        if(!english || !china){
            return res.json( JSON.stringify({
                isError: true,
                error: new Error("信息不完整！").toString()
            }) );
        }

        // 添加类型信息
        EntoCn.setPattern(english, contentType, china, function (err, pattern) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) )
            }
            res.json(JSON.stringify({
                isError: false,
                pattern: pattern
            }));
        });
    });
    
    // 单个课程数据存储
    app.post('/course/admin/save', function (req, res, next){

         permissionCheck.rank2(req, res, next);

    } , function (req, res) {

            // 规定字段数组
            var elementArary = ['courseName', 'courseType', 'courseAbstract',
                'courseContent', 'courseOrigin', 'password', 'isReady', 'isBroadcast',
                'teacher', 'price', 'courseTags', 'examine'];
            // 含有非字符串类型的数据最好先转化为JSON字符串然后再转化成JSON对象
            // 否则服务器会把Boolean类型会被处理成String类型
            var courseData = JSON.parse(req.body.courseData);
            // 课程数据
            var course = {};
            // 加载条件数据
            for(var part in courseData){
                if(arrayContain(elementArary, part)){
                    course[part] = courseData[part];
                }
                // 加入管理员信息
                if(part == 'examine'){
                    course[part].adminAccount = req.session.admin.account;
                }
            }

            console.log(course);

            // 存储课程数据 //
            var newCourse = new Course(course);
            newCourse.save(function (err, isPass) {
                if(err){
                    res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );

                }else {

                    // 如果是直播课程的话发布直播课程的相关数据 //
                    if(course.isBroadcast){

                        var broadcast = {
                            courseName: course.courseName,
                            courseType: course.courseType,
                            date: getDate(),
                            learners: [],
                            teacher: {
                                name: course.teacher,
                                password: course.password
                            }
                        };
                        var courseBroadcast = new CourseBroadcastData(broadcast);
                        courseBroadcast.save(function (err) {

                            if(err){
                                return res.json( JSON.stringify({
                                    error: err
                                }) );
                            }
                            // 成功后返回数据
                            res.json( JSON.stringify({
                                error: null
                            }) );
                        });
                    }else {

                        // 成功后返回数据
                        res.json( JSON.stringify({
                            isError: false
                        }) );
                    }
                }

            });

            function arrayContain(array, element) {

                for(var i = 0; i < array.length; i++){
                    if(array[i] == element){
                        return true;
                    }
                }
                return false;
            }
    });
    
    // 获取需要导入的课程数据
    app.post('/course/admin/load/:courseName', function(req, res, next){

        permissionCheck.rank2(req, res, next);

    }, function (req, res) {

        // 筛选条件
        var condition = {
            courseName: req.params.courseName
        };
        Course.getLoadData(condition, function (err, courseData) {

            if(err){
                console.log('获取导入课程的数据出错!');
                return res.json(JSON.stringify({
                    isError: true,
                    error: err
                }));
            }
            // 向客户端发回数据
            res.json(JSON.stringify({
                isError: false,
                loadData: courseData
            }));
        });
    });
    
    // 课程数据文件上传
    app.post('/course/data/upload/:courseName', function (req, res) {

        UploadAction(req, res);
    });

    // 指定类型的上传文件预览
    app.post('/course/data/preview/:courseName', function(req, res, next){

        permissionCheck.rank2(req, res, next);

    }, function (req,res) {

        // 预览数据的类型和所属课程
        var type = req.body.type;
        var courseName = req.params.courseName;

        var condition = {
            type: type,
            courseName: courseName
        };

        console.log('condition: ' + condition);

        UploadData.previewData(condition, function (err, dataArray) {
            if(err){
                return res.json( JSON.stringify({
                    error: err,
                    dataArray: dataArray
                }) );
            }
            res.json( JSON.stringify({
                error: null,
                type: condition.type,
                dataArray: dataArray
            }) );
        });

    });

}

module.exports = course_admin;
