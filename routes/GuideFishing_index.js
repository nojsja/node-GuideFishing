/**
 * Created by yangw on 2017/4/13.
 * 带渔首页引导路由
 */

function GuideFishing(app) {

    // 进入主页
    app.get('/index', function (req, res) {

        res.render('GuideFishing_index', {
            title: "带渔主页",
            slogan: "带渔",
            other: "课程"
        });

    });
}

module.exports = GuideFishing;