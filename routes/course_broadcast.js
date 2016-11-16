/**
 * Created by yangw on 2016/11/16.
 * 课程直播路由
 */

function course_broadcast(app) {

    // 获取课程直播页面
    app.get('/course/broadcast', function (req, res) {

        // 标题和房间号
        res.render('course_broadcast', {
            title: "课程直播",
            broadcastRoom: "1"
        });
    });
    
    // 获取课程直播数据
    app.post('/course/broadcast', function (req, res) {


    });
}

module.exports = course_broadcast;