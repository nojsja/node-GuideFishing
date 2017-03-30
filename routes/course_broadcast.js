/**
 * Created by yangw on 2016/11/16.
 * 课程直播路由
 */

// 从根目录定位
var locateFromRoot = require('../models/tools/LocateFromRoot');
// 读取返回图片目录地址
var ReadBroadcastImg = require('../models/ReadTypeImg');
// 直播课程模型
var broadcastData = require('../models/CourseBroadcastData');


function course_broadcast(app) {

    // 普通用户进入课程直播页面
    app.get('/course/broadcast/room/user/:id', function (req, res) {

        // 标题和房间号
        res.render('course_broadcast', {
            title: "课程直播",
            broadcastRoom: req.params.id,
            admin: false,
            slogan: "带渔",
            account: req.session.nickName || "游客",
            other: "课程直播"
        });
    });

    // 管理员登录聊天室(账户已经被验证过了)
    app.get('/course/broadcast/room/admin/:id', function (req, res) {

        // 客户端的请求信息和进入的房间号
        var referer = req.headers.referer;
        var room = req.params.id;

        // 验证未通过 (referer.indexOf('localhost:3000') < 0)
        if(!referer){

            console.log('验证未通过!');
            // 标题和房间号
            res.render('course_broadcastAdmin', {
                title: "登录验证",
                broadcastRoom: room,
                slogan: "带渔",
                other: "登录"
            });
        }else {

            console.log('管理员登录验证通过!房间名:  ' + room);
            // 标题和房间号
            res.render('course_broadcast', {
                title: "课程直播",
                broadcastRoom: room,
                admin: true,
                account: "管理员",
                slogan: "带渔",
                other: "课程直播"
            });
        }
    });

    // 用户进入所有课程直播聊天室索引页面
    app.get('/course/broadcast/index', function (req, res) {

        // 渲染页面到客户端
        res.render('course_broadcastIndex', {
            title: "所有直播",
            slogan: "带渔",
            other: "课程直播"
        });
    });

    // 获取所有直播内容聊天室
    app.post('/course/broadcast/readList', function (req, res) {

        var condition = {
            skip: req.body.skip || 0
        };
        // 课程图片地址
        var typeImgUrl = {};
        // 阅读地址和客户端访问地址
        // locateFromRoot 是当前执行文件的所在地址
        var readUrl = locateFromRoot('/public/images/courseType/');
        var visitUrl = '/images/courseType/';
        ReadBroadcastImg(readUrl, visitUrl, function (data) {
            typeImgUrl = data;
        });

        if(req.body.skip){
            condition.skip = req.body.skip;
        }
        if(req.body.limit){
            condition.limit = req.body.limit;
        }

        console.log("筛选条件: " + JSON.stringify(condition));

        broadcastData.readList(condition, function (err, broadcastArray) {
            if(err) {
                console.log('readBroadcastList error.');
                return res.json(JSON.stringify({
                    error: err,
                }));
            }
            console.log('readBroadList success.');
            res.json(JSON.stringify({
                preAddressAdmin: '/course/broadcast/room/adminCheck/',
                preAddressUser: '/course/broadcast/room/user/',
                broadcastArray: broadcastArray,
                typeImgUrl: typeImgUrl
            }));
        });
    });
    
    // 管理员进入聊天室前的登录验证页面
    app.get('/course/broadcast/room/adminCheck/:id', function (req, res) {

        // 标题和房间号
        res.render('course_broadcastAdmin', {
            title: "管理员登录",
            broadcastRoom: req.params.id,
            slogan: "带渔",
            other: "直播"
        });
    });

    // 管理员进行账户登录验证
    app.post('/course/broadcast/room/adminCheck/:id', function (req, res) {

        // 账户
        var account = req.body.account;
        var password = req.body.password;
        // 聊天室
        var room = req.params.id;

        broadcastData.teacherLogin({
            courseName: room,
            teacher: account,
            password: password
        }, function (err, isPass) {
            console.log(err + isPass);
            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }
            if(isPass){
                // 管理员账户
                req.session.adminAccount = account;
                res.json( JSON.stringify({
                    isError: false,
                    isPass: true,
                    url: '/course/broadcast/room/admin/' + room
                }) );
            }else {
                // 未通过验证
                res.json( JSON.stringify({
                    isError: false,
                    isPass: false
                }) );
            }
        });

    });

    
    // 获取课程直播数据
    app.post('/course/broadcast', function (req, res) {


    });
}

module.exports = course_broadcast;