/**
 * Created by yangw on 2016/12/6.
 * 管理员测试路由
 * 用于测试和查看所有页面
 */

// 引入
var Admin = require('../models/Admin');
var EntoCn = require('../models/EnToCn');
var getDate = require('../models/tools/GetDate');
var Routes = require('../models/Routes').routes;

// 权限验证
var permissionCheck = require('../models/permissionCheck').permissionCheck;

function admin(app){

    /* 获取页面 */
    app.get('/admin/routes', function (req, res, next) {

        permissionCheck.admin(req, res, next);

    } , function (req, res) {

        res.render('admin_routes', {
            title: '路由管理'
        });
    });
    
    /* 管理员登录页面 */
    app.get('/admin/login', function (req, res) {

        res.render('admin_login', {
            title: "启航管理员登录"
        });
    });

    /* 管理员注销 */
    app.get('/admin/logout', function (req, res) {

        req.session.admin = null;
        res.render('admin_login', {
            title: "启航管理员登录"
        });
    });

    /* 登录验证 */
    app.post('/admin/login', function (req, res) {

        var condition = {
            account: req.body.account,
            password: req.body.password
        };

        Admin.signin(condition, function (err, pass, info) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }
            if(!pass){
                return res.json( JSON.stringify({
                    isError: true,
                    error: "密码与账户不匹配！"
                }) );
            }
            // 验证成功,在session中写入管理员信息
            req.session.admin = {
                account: condition.account,
                nickName: info.nickName,
                examine: {
                    rank: info.examine.rank,
                    examineType: info.examine.rank == 0 ?
                         "无" : info.examine.examineType
                }
            };

            // 向客户端返回跳转地址
            res.json( JSON.stringify({
                isError: false,
                isPass: true,
                redirectUrl: "/admin/info"
            }) );
        });
    });

    /* 管理员进入个人页面 */
    app.get('/admin/info', function (req, res, next) {

        permissionCheck.admin(req, res, next);

    }, function (req, res) {

        console.log(req.session.admin.examine.examineType);
        res.render('admin_info', {
            title: "管理员中心",
            account: req.session.admin.account,
            nickName: req.session.admin.nickName,
            rank: req.session.admin.examine.rank,
            examineType: req.session.admin.examine.examineType
        });
    });

    /* 根据筛选条件获取所有管理员信息 */
    app.post ('/admin/get', function (req, res, next) {

        permissionCheck.rank0(req, res, next);

    }, function (req, res) {

        // 筛选
        Admin.getAdministrator({
            condition: req.body.condition || null,

        }, function (err, adminArray, adminAttrs) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) );
            }

            // 返回数据
            res.json( JSON.stringify({
                isError: false,
                adminArray: adminArray,
                adminAttrs: adminAttrs
            }) )
        });
    });

    /* 管理员获取个人信息和需要被验证的信息 */
    app.post('/admin/info', function (req, res, next) {

        permissionCheck.admin(req, res, next);
        
    }, function (req, res) {

        var rank = req.session.admin.examine.rank;
        var account = req.session.admin.account;
        var examineType = req.session.admin.examine.examineType;

        // 检查管理员权限
        if(rank == 0){
            // 获取权限约束
            Admin.getPermissionConstraints(function (constraints) {

                return res.json( JSON.stringify({
                    isError: false,
                    permissionConstraints: constraints,
                    EnToCn: EntoCn.getAllPattern("admin")
                }) );
            });

        }else if(rank == 1){

            Admin.getExamineData({
                examineType: examineType,
                status: 'isExaming'
            }, function (err, examineContent) {

                if(err){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );
                }
                return res.json( JSON.stringify({
                    isError: false,
                    examineContent: examineContent
                }) );

            });
        }else if(rank == 2){

            Admin.getExamineProgress({account: account}, function (err, examineProgress) {

                if(err){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );
                }
                return res.json( JSON.stringify({
                    isError: false,
                    examineProgress: examineProgress
                }) );
            });

        }else {

            res.json( JSON.stringify({
                isError: true,
                error: '账户信息有误'
            }) );
        }

    });

    /* 0级管理员权限管理 */
    app.post('/admin/permission/:action', function (req, res, next) {

        // 权限级别为0
        permissionCheck.rank0(req, res, next);

    }, function (req, res) {

        // 携带的管理员权限信息
        var condition = req.body.condition;
        var permissionConstraints;
        // 权限信息
        Admin.getPermissionConstraints(function (constraints) {
            permissionConstraints = constraints;
        });

        if(req.params.action == "add"){

            // 检查必要创建属性完整性
            for(let constraints in permissionConstraints.allAttributes){
                if(!condition[constraints]){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: new Error('没有完整的属性信息！').toString()
                    }) );
                }
            }
            var newAdmin = new Admin(condition);
            newAdmin.save(function (err, isPass) {

                if(err){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );
                }
                // 存储成功
                if(isPass){
                    console.log('存储成功！');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: true
                    }) );
                }else {
                    console.log('存储失败！');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: false
                    }) );
                }
            });
        }

        // 编辑权限
        if(req.params.action == "edit"){

            // 检查属性完整性
            for(let constraints in permissionConstraints.changeableAttributes){
                if(!condition[constraints]){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: new Error('没有完整的属性信息！').toString()
                    }) );
                }
            }

            // 更改全新
            Admin.permissionAssign(condition, function (err, isPass) {

                if(err){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );
                }
                if(isPass){
                    console.log('修改成功！');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: true
                    }) );
                }else {
                    console.log('修改失败！');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: false
                    }) );
                }
            });
        }

        if(req.params.action == "delete"){

            if(!condition.account){
                return res.json( JSON.stringify({
                    isError: true,
                    error: new Error('没有完整的属性信息！').toString()
                }) );
            }
            // 移除权限信息
            Admin.removePermission(condition, function (err, isPass) {

                if(err){
                    return res.json( JSON.stringify({
                        isError: true,
                        error: err.toString()
                    }) );
                }
                // 删除成功
                if(isPass){
                    console.log('删除成功!');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: true
                    }) )
                }else {
                    console.log('删除失败!');
                    res.json( JSON.stringify({
                        isError: false,
                        isPass: false
                    }) );
                }
            });
        }
    });

    /* 管理员验证课程或测评数据条目 */
    app.post('/admin/:type/examine', function (req, res, next) {

        permissionCheck.rank1(req, res, next);

    }, function (req, res) {

        var condition = {
            contentName: req.body.contentName,
            contentType: req.body.contentType,
            examineText: req.body.examineText,
            examineAccount: req.session.admin.account,
            adminAccount: req.body.adminAccount,
            examineType: req.params.type,
            status: req.body.status,
            date: getDate()
        };

        console.log(condition);

        // 验证信息完整性
        for( let attr in condition){
            if(!attr){
                return req.json( JSON.stringify({
                    isError: true,
                    error: new Error("验证信息不全！")
                }) );
            }
        }

        // 审查逻辑
        Admin.examine(condition.status, condition, function (err, isPass) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err.toString()
                }) )
            }
            console.log('admin');
            // 返回审查情况
            res.json( JSON.stringify({
                isError: false,
                isPass: isPass
            }) );
        });
    });
    
    /* 获取所有路由 */
    app.post('/admin/routes', function(req, res, next){

        permissionCheck.admin(req, res, next);

    }, function (req, res) {

        // 向客户端发送数据
        res.json(JSON.stringify( {
            routes: Routes
        }) );
    });

    /* 页脚页面 */
    app.get('/admin/footer/:type', function (req, res) {

        res.render('admin_footerPage', {
            title: "其它",
            content: req.param("type")
        });
    });
}

module.exports = admin;