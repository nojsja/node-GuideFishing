
/**
 * Created by yangw on 2016/10/19.
 * 评测题目相关的路由
 */

/**
 * 评测结果数据格式:
 * submitData.choiseArray = [
    {choiseTag: "A", itemMode: "CA"},
    {choiseTag: "B", itemMode: "CB"},
    {choiseTag: "C", itemMode: "CC"}
 ];
 */

/* 引入工厂模式 */
var scoreFactory = require('../models/ScoreFactory.js');
var AllTest = require('../models/AllTest.js');
/* 权限检查 */
var permissionCheck = require('../models/permissionCheck').permissionCheck;
/* 中英转换 */
var EnToCn = require('../models/EnToCn');
/* 读取磁盘图片数据形成地址 */
var ReadTestImg = require('../models/ReadTypeImg');
/* 获取根目录 */
var locateFromRoot = require('../models/tools/LocateFromRoot');
/* 获取当前日期 */
var getDate = require('../models/tools/GetDate');
/* 用户模型 */
var User = require('../models/User');

/* 测试题目路由 */
function test(app) {

    var testRoute = {};

    /* 获取测试detail页面 */
    app.get('/test/detail/:testType/:testTitle', function (req, res) {

        var testTitle = req.params.testTitle,
            testType = req.params.testType;

        var condition = {
            condition: {
                testTitle: testTitle,
                testType: testType
            },
            select: {
                abstract: 1,
                date: 1,
                frequency: 1,
                testTags: 1
            }
        };
        // 当前登录账户
        var account = req.session.account;
        console.log(account);
        // 返回的测评信息
        var responseTest = {
            title: '评测详情',
            testTitle: testTitle,
            testType: testType,
            testTags: [],
            abstract: 'error!!!',
            date: 'error!!!',
            frequency: 'error!!!',
            isError: false,
            error: null,
            isPurchased: 'unknown'
        };

        AllTest.getDetail(condition, function (err, doc) {

            // 数据监测
           if(err) {
               return res.render('error', {
                   message: "读取出错！",
                   error: {
                       status: 404,
                       stack: err.stack
                   }
               });
           }

           responseTest.abstract = doc.abstract;
           responseTest.date = doc.date;
           responseTest.frequency  = doc.frequency;
           responseTest.testTags = doc.testTags;

           if(!account){
               return res.render('test_detail', responseTest);
           }

           /* 检查购买情况 */
           User.purchaseCheck({
               account: account,
               data: {
                   itemName: testTitle,
                   itemType: testType
               }
           }, function (err, pass) {

               if(err){
                   responseTest.isError = true;
                   responseTest.error = err;
                   return res.render('test_detail', responseTest);
               }else {
                   if(pass){
                       responseTest.isPurchased = true;
                   }else {
                       responseTest.isPurchased = false;
                   }
                   res.render('test_detail', responseTest);
               }
           });
        });
    });

    // 获取课程分类页面
    app.get('/test/classification', function (req, res) {

        res.render('test_classification',{
            title: '所有测评分类'
        });
    });

    // 获取所有课程分类信息
    app.post('/test/classification', function ( req, res) {

        AllTest.getClassification(function (err, classificationInfo) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) );
            }

            var readUrl = locateFromRoot('/public/images/testType/');
            var visitUrl = '/images/testType/';

            ReadTestImg(readUrl, visitUrl, function (imgArray) {

                res.json( JSON.stringify({
                    isError: false,
                    classificationInfo: classificationInfo,
                    testTypeChina: EnToCn.getAllPattern("testType"),
                    testTypeImage: imgArray
                }) );
            });

        });
    });

    /* 获取测试视图主页 */
    app.get('/test/view/:testType/:testTitle', function (req, res, next) {

        if(req.session.admin){
            return next();
        }
        testRoute.purchaseCheck(req, res, next);

        }, function (req, res) {

        //评测类型
        var testType = req.params.testType,
            testTitle = req.params.testTitle;

        // 读取详情条件
        // select 确定选定区间
        // condition 确定筛选条件

        var totalCondition = {
            select: {
                abstract: 1,
                clickRate: 1,
                date: 1,
                testTags: 1
            },
            condition: {
                testTitle: testTitle,
                testType: testType
            }
        };

        // 读取一个测评数据
        AllTest.getDetail(totalCondition, function (err, data) {

            // 返回的课程数据
            var testData = {
                title: "测评页面",
                testType: testType,
                testTitle: testTitle,
                testTags: [],
                abstract: null,
                clickRate: null,
                date: null,
                isError: false,
                error: null
            };

            if(err) {
                var info = {
                    message: "查询出错",
                    error: {
                        status: "500"
                    }
                }
                return res.render('error', info);
            }

            if(data){
                testData.abstract = data["abstract"];
                testData.clickRate = data["clickRate"];
                testData.date = data["date"];
                testData.testTags = data["testTags"];

                // 加入审核信息
                testData.action = "view";

                res.render('test_view', testData);

            }else {
                var info = {
                    message: "没有查询到相关测评信息！",
                    error: {
                        status: "500"
                    }
                }
                res.render('error', info);
            }
        });
    });

    /* 获取测评审查页面 */
    app.get('/test/examine/:testType/:testTitle', function (req, res, next) {

        if(req.session.admin && req.session.admin.examine.rank == 1){

            return next();
        }
        return res.render('error', {
            message: '404',
            error: {
                status: '禁止访问'
            }
        });

    }, function (req, res) {

        //评测类型
        var testType = req.params.testType,
            testTitle = req.params.testTitle;

        // 读取详情条件
        // select 确定选定区间
        // condition 确定筛选条件

        var totalCondition = {
            select: {
                abstract: 1,
                clickRate: 1,
                date: 1,
                testTags: 1
            },
            condition: {
                testTitle: testTitle,
                testType: testType
            }
        };

        // 读取一个测评数据
        AllTest.getDetail(totalCondition, function (err, data) {

            // 返回的课程数据
            var testData = {
                title: "测评页面",
                testType: testType,
                testTitle: testTitle,
                testTags: [],
                abstract: null,
                clickRate: null,
                date: null,
                isError: false,
                error: null
            };

            if(err) {
                var info = {
                    message: "查询出错",
                    error: {
                        status: "500"
                    }
                }
                return res.render('error', info);
            }

            if(data){
                testData.abstract = data["abstract"];
                testData.clickRate = data["clickRate"];
                testData.date = data["date"];
                testData.testTags = data["testTags"];

                // 加入审核信息
                testData.action = "examine";

                res.render('test_view', testData);

            }else {
                var info = {
                    message: "没有查询到相关测评信息！",
                    error: {
                        status: "500"
                    }
                }
                res.render('error', info);
            }
        });
    });

    /* 获取一组测试题目 */
    app.post('/test/view/:testType/:testTitle', function(req, res, next){

        if(req.session.admin){
            return next();
        }
        testRoute.purchaseCheck(req, res, next);

    }, function (req, res) {

        //筛选条件
        var condition = {
            testType: req.params.testType,
            testTitle: req.params.testTitle
        };
        //得到题目信息
        AllTest.getDetail({
            select: {
                testGroup: 1,
                testTags: 1,
                examine: 1,
            },
            condition: condition
        }, function (err, doc) {
            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err,
                    testGroup: [],
                    testTags: [],
                    examine: {}
                }) );
            }
            //成功读取到后返回本组题目
            return res.json( JSON.stringify({
                isError: false,
                testGroup: doc.testGroup,
                testTags: doc.testTags,
                examine: doc.examine
            }) );
        });
    });

    // 获取类型图片
    app.post('/test/detail/readTypeImage', function (req, res) {

        var readUrl = locateFromRoot('/public/images/testType/');
        var visitUrl = '/images/testType/';
        ReadTestImg(readUrl, visitUrl, function (imgArray) {

            res.json(JSON.stringify({
                imageArray: imgArray
            }))
        });
    });

    /* 获取得分模式信息 */
    app.post('/test/getScoreMode', function (req, res) {

        // 返回的模式信息
        var data = {
            scoreModeGroup: scoreFactory.scoreModeGroup
        };
        res.json(JSON.stringify(data));
    });
    
    /* 提交评测结果 */
    app.post('/test/submit', function (req, res) {

         // 上传的选项结果
        var submitData = req.body.submitData;

        var testResult = new scoreFactory(submitData, function (resultData) {
            //返回评测结果的json数据,包括评测得分和结果分析
            res.json(JSON.stringify(resultData));
        });
    });

    /* 存储某个测评的弹幕 */
    app.post('/test/danmu/:testType/:testTitle', function (req, res, next) {

        permissionCheck.userLogin(req, res, next);

    }, function (req, res) {

        var testType = req.params.testType;
        var testTitle = req.params.testTitle;
        var danmu = req.body.danmu;

        if(!testType || !testTitle || !danmu){

            return res.json( JSON.stringify({
                isError: true,
                error: new Error('数据不完整！').toString()
            }) );
        }

        // 添加用户信息
        danmu.user = req.session.account;
        danmu.date = getDate();

        AllTest.danmuSave({
            testTitle: testTitle,
            testType: testType,
            danmu: danmu

        }, function (err, isPass) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) );
            }
            if(isPass){

                res.json( JSON.stringify({
                    isError: false
                }) );

            }else {

                res.json( JSON.stringify({
                    isError: true,
                    error: new Error('没有相关测评信息!').toString()
                }) );
            }

        });
    });

    /* 读取某个测评的弹幕 */
    app.get('/test/danmu/:testType/:testTitle', function (req, res) {

        var testType = req.params.testType;
        var testTitle = req.params.testTitle;

        if(!testType || !testTitle){

            return res.json( JSON.stringify({
                isError: true,
                error: new Error('查询信息不全！').toString()
            }) );
        }
        AllTest.danmuRead({
            testTitle: testTitle,
            testType: testType

        }, function (err, danmuArray) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) );
            }

            if(danmuArray){
                // 发送弹幕json信息
                res.json( JSON.stringify({
                    isError: false,
                    danmuArray: danmuArray
                }) );
            }else {
                // 发送弹幕json信息
                res.json( JSON.stringify({
                    isError: true,
                    error: new Error('没有相关数据！').toString()
                }) );
            }

        });
    });

    // 课程购买检测中间件
    testRoute.purchaseCheck = function (req, res, next) {

        // 用户识别账户
        var account = req.session.account;
        if(!account){

            return res.render('user_login', {
                title: "用户登录",
                slogan: "启航",
                other: "登录"
            });
        }

        return next();

        // var testTitle = req.params["testTitle"],
        //     testType = req.params["testType"];

        // User.purchaseCheck({
        //     account: account,
        //     data: {
        //         itemName: testTitle,
        //         itemType: testType
        //     }
        // }, function (err, pass) {
        //
        //     // 查询出错
        //     if(err){
        //         res.render('error', {
        //             message: "query error!",
        //             error: {
        //                 status: '500',
        //             }
        //         });
        //     }else {
        //         if(pass){
        //             // 交由下一个处理
        //             return next();
        //         }
        //         res.render('error', {
        //             message: "你还没有购买课程",
        //             error: {
        //                 status: '404'
        //             }
        //         });
        //     }
        // });

    };
}

module.exports = test;