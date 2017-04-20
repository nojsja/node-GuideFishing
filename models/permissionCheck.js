/**
 * Created by yangw on 2017/4/21.
 * 权限验证中间件
 */

var permissionCheck = {

    // 管理员验证
    admin: function (req, res, next) {

        if(req.session.admin){
            return next();
        }
        if(req.method.toLowerCase() === "get"){

            res.render('error', {
                message: '需要管理员权限',
                error: {
                    status: '404'
                }
            });
        }else {

            res.json(JSON.stringify( {
                isError: true,
                error: new Error('需要管理员权限').toString()
            } ));
        }
    },

    // 0级管理员验证
    rank0: function (req, res, next) {

        if(req.session.admin && req.session.admin.examine.rank == 0){
            return next();
        }
        if(req.method.toLowerCase() === "get"){

            res.render('error', {
                message: '需要0级管理员权限',
                error: {
                    status: '404'
                }
            });
        }else {

            res.json(JSON.stringify( {
                isError: true,
                error: new Error('需要0级管理员权限').toString()
            } ));
        }

    },
    // 1级管理员验证
    rank1: function (req, res, next) {

        if(req.session.admin && req.session.admin.examine.rank == 1){
            return next();
        }
        if(req.method.toLowerCase() === "get"){

            res.render('error', {
                message: '需要1级管理员权限',
                error: {
                    status: '404'
                }
            });
        }else {

            res.json(JSON.stringify( {
                isError: true,
                error: new Error('需要1级管理员权限').toString()
            } ));
        }

    },
    // 2级管理员验证
    rank2: function (req, res, next) {

        if(req.session.admin && req.session.admin.examine.rank == 2){
            return next();
        }
        if(req.method.toLowerCase() === "get"){

            res.render('error', {
                message: '需要2级管理员权限',
                error: {
                    status: '404'
                }
            });
        }else {

            res.json(JSON.stringify( {
                isError: true,
                error: new Error('需要2级管理员权限').toString()
            } ));
        }

    },
    // 用户登录验证
    userLogin: function (req, res, next) {

        if(req.session.account){
            return next();
        }
        if(req.method.toLowerCase() === "get"){

            res.render('login', {
                title: "用户登录"
            });
        }else {

            res.json(JSON.stringify( {
                isError: true,
                error: new Error('需要登录账户').toString()
            } ));
        }

    }
};

exports.permissionCheck = permissionCheck;

