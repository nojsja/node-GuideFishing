/**
 * 主页路由*/

function index(app) {

    /* 获取评测主页 */
    app.get('/', function (req, res) {
        res.render('index', {
            title: '评测系统主页'
        });
    });

    /* 请求评测主页 */
    app.post('/', function (req, res) {
        res.render('index', {
            title: '主页'
        })
    });
}

module.exports = index;
