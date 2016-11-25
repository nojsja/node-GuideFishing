/**
 * Created by yangw on 2016/11/16.
 * 课程直播路由
 */

function course_broadcast(app) {

    // 普通用户进入课程直播页面
    app.get('/course/broadcast/room/user/:id', function (req, res) {

        // 标题和房间号
        res.render('course_broadcast', {
            title: "课程直播",
            broadcastRoom: req.params.id,
            admin: false
        });
    });

    // 管理员登录聊天室
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
                broadcastRoom: room
            });
        }else {

            console.log('管理员登录验证通过!房间名:  ' + room);
            // 标题和房间号
            res.render('course_broadcast', {
                title: "课程直播",
                broadcastRoom: room,
                admin: true
            });
        }
    });

    // 管理员进入聊天室前的登录验证页面
    app.get('/course/broadcast/room/adminCheck/:id', function (req, res) {

        // 标题和房间号
        res.render('course_broadcastAdmin', {
            title: "管理员登录",
            broadcastRoom: req.params.id,
        });
    });

    // 管理员进行账户登录验证
    app.post('/course/broadcast/room/adminCheck/:id', function (req, res) {

        // 账户
        var account = req.body.account;
        var password = req.body.password;
        console.log(account + password);
        // 聊天室
        var room = req.params.id;

        // 登录验证
        if( account == 'admin' && password == 'admin_password'){

            res.json(JSON.stringify({
                pass: true,
                url: '/course/broadcast/room/admin/' + room
            }));
        }else {

            // 未通过验证
            res.json(JSON.stringify({
                pass: false
            }));
        }
    });

    
    // 获取课程直播数据
    app.post('/course/broadcast', function (req, res) {


    });
}

module.exports = course_broadcast;