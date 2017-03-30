/**
 * Created by yangw on 2016/12/6.
 * 管理员测试路由
 * 用于测试和查看所有页面
 */

function ADMIN_TEMP(app){

    // 路由对象
    // isVariable -- 是否是可输入类型的变量
    var routes = {

        course: [{
            text: "[移动端查看] 正式课程列表页面",
            url: '/course/index',
            isVariable: false
        }, {
            text: "[移动端查看] 直播课程列表页面",
            url: '/course/broadcast/index',
            isVariable: false
        }, {
            text: "[桌面端查看] 管理员直播课程编辑页面",
            url: '/course/admin/edit',
            isVariable: false
        }, {
            text: "[移动端查看] 管理员直播课程登录页面",
            url: '/course/broadcast/room/adminCheck/:roomID',
            isVariable: true
        }, {
            text: "[移动端查看] 以用户身份进入某个课程直播间",
            url: '/course/broadcast/room/user/:roomID',
            isVariable: true
        }, {
            text: "[移动端查看] 以管理员身份进入某个课程直播间",
            url: '/course/broadcast/room/admin/:roomID',
            isVariable: true
        }],

        test:[{
            text: "[移动端查看] 所有测评列表页面",
            url: '/test/index',
            isVariable: false
        }, {
            text: "[桌面端查看] 管理员管理所有测评题目页面",
            url: '/test/admin/manager',
            isVariable: false
        }, {
            text: "[桌面端查看] 管理员编辑测评题目页面",
            url: '/test/admin/create',
            isVariable: false
        }],

        recruitment: [{
            text: "[移动端查看] 带渔入口页面",
            url: '/recruitment/index',
            isVariable: false
        }]
    };

    /* 获取页面 */
    app.get('/admin/routes', function (req, res, next) {
        adminCheck(req, res, next);
    } , function (req, res) {

        res.render('admin_routes', {
            title: '路由管理'
        });
    });
    
    /* 管理员登录页面 */
    app.get('/admin/login', function (req, res) {

        res.render('admin_login', {
            title: "带渔管理员登录"
        });
    });

    /* 登录验证 */
    app.post('/admin/login', function (req, res) {

        var account = req.body.account,
            password = req.body.password;

        if(account == "Johnson" && password == "020154"){
            req.session.admin = "Johnson";
            res.json( JSON.stringify({
                isError: false,
                pass: true,
                redirectUrl: "/admin/routes"
            }) );
        }else {
            res.json( JSON.stringify({
                isError: false,
                pass: false
            }) );
        }
    });
    
    /* 获取所有路由 */
    app.post('/admin/routes', function(req, res, next){
        adminCheck(req, res, next);
    }, function (req, res) {

        // 向客户端发送数据
        res.json(JSON.stringify( {
            routes: routes
        }) );
    });

    /* 页脚页面 */
    app.get('/admin/footer/:type', function (req, res) {

        res.render('admin_footerPage', {
            title: "其它",
            content: req.param("type")
        });
    });

    /* 权限验证中间件 */
    var adminCheck = function (req, res, next) {

        // 验证用户
        if(req.session.admin){
            return next();
        }else {
            res.render('admin_login', {
                title: "管理员登录"
            });
        }
    };
}

module.exports = ADMIN_TEMP;