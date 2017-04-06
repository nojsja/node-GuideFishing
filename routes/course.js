/**
 * Created by yangw on 2016/11/8.
 * 带渔课程路由管理
 */

/* 课程模型 */
var Course = require('../models/Course');
/* 中英转换 */
var EnToCn = require('../models/EnToCn');
/* 读取磁盘图片数据形成地址 */
var ReadCourseImg = require('../models/ReadTypeImg');
/* 用户模型 */
var User = require('../models/User');
/* 获取根目录 */
var locateFromRoot = require('../models/tools/LocateFromRoot');

function course(app){

    // 局部代理变量
    var courseRoute = {};

    // 获取课程主页
    app.get('/course/index', function (req, res) {

        res.render('course_index', {
            title: "课程主页",
            slogan: "带渔",
            other: "课程"
        });
    });
    
    // 获取课程类型和中文
    app.post('/course/courseType', function (req, res) {

        res.json( JSON.stringify({
            isError: false,
            // 转化为字符串类型
            courseTypeChina: EnToCn.getAllPattern("courseType")
        }) );
    });

    // 获取课程详情介绍页面
    app.get('/course/detail/:courseType/:courseName', function (req, res) {

        // 读取详情条件
        // select 确定选定区间
        // condition 确定筛选条件

        var totalCondition = {
            select: {},
            condition: {}
        };

        totalCondition.condition.courseType = req.params.courseType;
        totalCondition.condition.courseName = req.params.courseName;
        totalCondition.select = {
            courseAbstract: 1,
            courseTags: 1,
            clickRate: 1,
            date: 1
        };

        // 读取一个课程数据
        Course.readOne(totalCondition, function (err, data) {

            // 返回的课程数据
            var courseData = {
                title: "课程详情",
                courseType: req.params["courseType"],
                courseName: req.params["courseName"],
                courseAbstract: null,
                courseTags: [],
                clickRate: null,
                isPurchased: null,
                date: null,
                isError: false,
                error: null
            };

            if(err){
                courseData.isError = true;
                courseData.error = err;
                return res.render('course_detail', courseData);
            }

            courseData.courseAbstract = data["courseAbstract"];
            courseData.clickRate = data["clickRate"];
            courseData.date = data["date"];
            courseData.courseTags = data["courseTags"];

            // 当前登录账户
            var account = req.session.account;
            if(!account){
                courseData.isPurchased = "unknown";
                return res.render('course_detail', courseData);
            }

            // 看是否购买
            User.purchaseCheck({
                account: account,
                data: {
                    itemName: courseData.courseName,
                    itemType: courseData.courseType
                }
            }, function (err, pass) {

                if(err){
                    courseData.isError = true;
                    courseData.error = err;
                    return res.render('course_detail', courseData);
                }

                if(pass){
                    courseData.isPurchased = true;
                }else {
                    courseData.isPurchased = false;
                }

                // 返回页面
                res.render('course_detail', courseData);
            });
        });
    });

    /* 获取滑动组件图片数组 */
    app.post('/course/readSlideImage', function (req, res) {

        var readUrl = locateFromRoot('/public/images/courseSlide/');
        var visitUrl = '/images/courseSlide/';

        ReadCourseImg(readUrl, visitUrl, function (data) {

            if(data){

                var imageArray =  [];
                for(var image in data){
                    imageArray.push({
                        text: image,
                        imageUrl: data[image]
                    });
                }
                res.json( JSON.stringify({
                    slideImageArray: imageArray,
                    isError: false
                }) );
            }else {
                res.json( JSON.stringify({
                    isError: true,
                    error: data
                }) );
            }
        });
    });

    /* 获取类型图片 */
    app.post('/course/detail/readTypeImage', function (req, res) {

        var readUrl = locateFromRoot('/public/images/courseType/');
        var visitUrl = '/images/courseType/';
        ReadCourseImg(readUrl, visitUrl, function (imgArray) {

            res.json(JSON.stringify({
                imageArray: imgArray
            }))
        });
    });
    
    /* 获取课程学习页面 */
    app.get('/course/view/:courseType/:courseName', function (req, res, next) {
        courseRoute.purchaseCheck(req, res, next);

    }, function (req, res) {

        res.render('course_view', {

            title: "课程学习",
            slogan: "带渔",
            other: "课程",
            courseType: req.params.courseType,
            courseName: req.params.courseName
        });
    });

    /* 获取课程的热门内容 */
    app.post('/course/readHot', function (req, res) {

        // 获取热门数据
        Course.getPopular(function (err, popularArray) {

            if(err){
                console.log('获取课程热门数据出错!');
                return res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }
            for(var i = 0; i < popularArray.length; i++){
                popularArray[i].preDress = '/course/detail/';
            }
            // 返回数据
            res.json( JSON.stringify({
                isError: false,
                popularArray: popularArray
            }) );
        });
    });

    /* 获取某一个课程的详细内容 */
    app.post('/course/view/readOne', function (req,res) {

        // 查询条件
        var totalCondition = {
            condition: {},
            select: {}
        };
        totalCondition.condition.courseType = req.body.courseType;
        totalCondition.condition.courseName = req.body.courseName;
        // 选择条件 课程编辑内容,直播内容,直播标志,讲师,日期
        totalCondition.select = {
            courseContent: 1,
            courseTags: 1,
            courseType: 1,
            courseName: 1,
            isBroadcast: 1,
            courseOrigin: 1,
            teacher: 1,
            date: 1
        };

        Course.readOne(totalCondition, function (err, data) {

            if(err){
                return res.json(JSON.stringify({
                    error: err
                }));
            }
            // 非基本类型的数据发往客户端需要JSON格式化,解析的时候再解析成对象来操作

            for(var attr in totalCondition.select){
                totalCondition.select[attr] = data[attr];
            }

            res.json( JSON.stringify(totalCondition.select) );
        });
    });

    /* 读取课程列表 */
    app.post('/course/readCourseList', function (req, res) {

        var condition = {};
        // 课程图片地址
        var typeImgUrl = {};
        // 阅读地址和客户端访问地址
        // locateFromRoot 是当前执行文件的所在地址
        var readUrl = locateFromRoot('/public/images/courseType/');
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
            condition.skip = Number.parseInt(req.body.skip) || 0;
        }
        if(req.body.limit){
            condition.limit = Number.parseInt(req.body.limit) || 15;
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

    /* 更新popular表 */
    app.get('/popular/course/update', function (req, res) {

        Course.updatePopular(function (err) {
            if(err){
                console.log(err);
                res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }else {
                res.json( JSON.stringify({
                    isError: false
                }) );
            }

        });
    });

    /* 获取推荐课程内容 */
    app.post('/course/recommendation', function (req, res) {

        // 筛选条件
        var condition = {};

        condition.tagNameArray = req.body.tagNameArray;
        condition.tagTypeArray = req.body.tagTypeArray;
        condition.count = req.body.count;

        if(!condition.tagTypeArray || !condition.tagNameArray) {
            return res.json( JSON.stringify({
                isError: true,
                error: new Error("发送数据有误！")
            }) );
        }

        condition.filter = req.body.filter ? {
            filterContentName: req.body.filter.filterContentName,
            filterContentType: req.body.filter.filterContentType

        } : null;

        Course.getRecommendation(condition, function (err, tagContentArray) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) );
            }
            res.json( JSON.stringify({
                isError: false,
                tagContentArray: tagContentArray
            }) );
        });
    });

    /* 通用中间件和函数 */

    // 课程购买检测中间件
    courseRoute.purchaseCheck = function (req, res, next) {

        // 用户识别账户
        var account = req.session.account;
        if(!account){

            return res.render('user_login', {
                title: "用户登录",
                slogan: "带渔",
                other: "登录"
            });
        }

        var courseName = req.params["courseName"],
            courseType = req.params["courseType"];

        User.purchaseCheck({
            account: account,
            data: {
                itemName: courseName,
                itemType: courseType
            }
        }, function (err, pass) {

            // 查询出错
            if(err){
                res.render('error', {
                    message: "query error!",
                    error: {
                        status: '500',
                    }
                });
            }else {
                if(pass){
                    // 交由下一个处理
                    return next();
                }
                res.render('error', {
                   message: "你还没有购买课程",
                    error: {
                       status: '404'
                    }
                });
            }
        });

    };

}

module.exports = course;