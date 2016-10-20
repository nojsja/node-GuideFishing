/**
 * Created by yangw on 2016/10/19.
 * 管理员相关的路由.
 */

var AllTest = require('../models/AllTest.js');

function admin(app) {

    /* 获取测试detail页面 */
    app.get('/admin', function (req, res) {
        res.render('admin', {
            title: '管理'
        });
    });

    /* 存储一个文档 */
    app.post('/save', function (req, res) {
        var testGroup = {
            testType: "character",
            scoreMode: "MA",
            abstract: "这是一组性格测试的题目集合",
            testTitle: "这是这组性格测试的标题",
            frequency: 2,
            scoreSection: [
                {
                    score: 40,
                    result: "40分和40分以下的结果"
                },{
                    score: 100,
                    result: "40分到100分的结果"
                }
            ],
            testGroup: [
                {
                    itemTitle: "请选择一个",
                    itemNumber: 1,
                    itemChoise: [
                        {
                            choiseTag: "A",
                            choiseContent: "选项A"
                        },{
                            choiseTag: "B",
                            choiseContent: "选项B"
                        }
                    ]
                },{
                    itemTitle: "请选择一个",
                    itemNumber: 2,
                    itemChoise: [
                        {
                            choiseTag: "A",
                            choiseContent: "选项A"
                        },{
                            choiseTag: "B",
                            choiseContent: "选项B"
                        },
                    ]
                }
            ],
        };
        var newTest = new AllTest(testGroup);
        console.log('1');
        newTest.save(function (err) {
            if(err){
                console.log('it is error!');
                res.send('ok');
            }else {
                console.log('存储成功!');
                res.send('ok');
            }
        });
    });
}

module.exports = admin;