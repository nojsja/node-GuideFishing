/**
 * Created by yangw on 2017/4/17.
 */

exports.routes = {

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
}