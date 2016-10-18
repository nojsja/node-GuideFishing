/**
 * 主页路由*/

function index(app) {

    /* 获取评测主页 */
    app.get('/', function (req, res) {
        res.render('index', {
            title: '评测系统主页'
        });
    });

    /* 读取评测列表 */
    app.post('/readList', function (req, res) {

    });

    /* 读取热门内容列表 */
    app.post('/readHot', function (req, res) {
        
    });
}

module.exports = index;
