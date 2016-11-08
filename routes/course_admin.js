/**
 * Created by yangw on 2016/11/8.
 * 课程后台管理页面
 */

function course_admin(app) {
    
    // 进入所有课程管理后台
    app.get('/course/admin/manager', function (req, res) {

        res.render('course_adminManager', {
            title: "课程管理"
        });
    });

    app.get('/course/admin/edit', function (req, res) {

        res.render('course_adminEdit', {
            title: "课程编辑"
        });
    });
}

module.exports = course_admin;
