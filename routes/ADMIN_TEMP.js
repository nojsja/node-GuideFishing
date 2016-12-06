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
            text: "正式课程列表页面",
            url: '/course/index',
            isVariable: false
        }, {
            text: "直播课程列表页面",
            url: '/course/broadcast/index',
            isVariable: false
        }, {
            text: "管理员直播课程编辑页面",
            url: '/course/admin/edit',
            isVariable: false
        }, {
            text: "管理员直播课程登录页面",
            url: '/course/broadcast/room/adminCheck/:roomID',
            isVariable: true
        }, {
            text: "以用户身份进入某个课程直播间",
            url: '/course/broadcast/room/user/:roomID',
            isVariable: true
        }, {
            text: "以管理员身份进入某个课程直播间",
            url: '/course/broadcast/room/admin/:roomID',
            isVariable: true
        }],

        test:[{
            text: "所有测评列表页面",
            url: '/test/index',
            isVariable: false
        }, {
            text: "管理员管理所有测评题目页面",
            url: '/test/admin/manager',
            isVariable: false
        }, {
            text: "管理员编辑测评题目页面",
            url: '/test/admin/create',
            isVariable: false
        }],

        recruitment: [{
            text: "带渔入口页面",
            url: '/recruitment/index',
            isVariable: false
        }]
    };

    /* 获取页面 */
    app.get('/admin_temp', function (req, res) {

        res.render('ADMIN_TEMP', {
            title: '路由管理',
            slogan: '所有路由'
        });
    });
    
    /* 获取所有路由 */
    app.post('/admin_temp', function (req, res) {

        // 向客户端发送数据
        res.json(JSON.stringify( {
            routes: routes
        }) );
    });
}

module.exports = ADMIN_TEMP;