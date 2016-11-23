/**
 * Created by yangw on 2016/11/16.
 * 课程直播路由
 */

function course_broadcast(app) {

    // 获取课程直播页面
    // 路径中获取房间的id
    app.get('/course/broadcast/room/:id', function (req, res) {

        // 标题和房间号
        res.render('course_broadcast', {
            title: "课程直播",
            broadcastRoom: req.params.id
        });
    });
    
    // 获取课程直播数据
    app.post('/course/broadcast', function (req, res) {

        
    });
    
    // 获取测试页面
    app.get('/recordTest', function (req, res) {

        res.render('recordTest', {

        });
    });
}

module.exports = course_broadcast;