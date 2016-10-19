/**
 * Created by yangw on 2016/10/19.
 * 评测题目相关的路由
 */

function test(app) {

    /* 获取测试detail页面 */
    app.get('/testDetail', function (req, res) {
        res.render('testDetail', {
            title: '评测详情'
        });
    });

    /* 获取测试视图主页*/
    app.get('/testView', function (req, res) {
       res.render('testView', {
           title: '评测页面'
       });
    });
}

module.exports = test;