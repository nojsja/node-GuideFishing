/**
 * Created by yangw on 2016/11/8.
 * 带渔课程路由管理
 */

function course(app){

    // 获取课程主页
    app.get('/course/index', function (req, res) {

        res.render('course_index', {
            title: "课程主页"
        });
    });

    // 获取课程详情介绍页面
    app.get('/course/detail', function (req, res) {
       
        res.render('course_detail', {
            title: "课程详情"
        });
    });
    
    // 获取课程学习页面
    app.get('/course/view', function (req, res) {

        res.render('course_view', {
            title: "课程学习"
        });
    });


}

module.exports = course;