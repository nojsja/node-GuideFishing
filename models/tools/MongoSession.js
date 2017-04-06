/**
 * Created by yangw on 2016/11/16.
 */

var format = require('util').format;
// 定位更目录
var locateFromRoot = require('./LocateFromRoot');
//项目设置
var settings = require(locateFromRoot('/MongoConfig'));
//持久化session信息
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

function MongoSession(app) {

    console.log('mongo-session is working...');
    //session持久化
    app.use(session({
            secret: settings.cookieSecret,
            key:settings.db,
            cookie:{
                maxAge:1000*60*60*24*3,
                secure: false
            },
            store: new MongoStore(
                {url:format("mongodb://%s:%s@%s:%s/%s",settings.user, settings.password, settings.host, settings.port, settings.db)}
            ),
            resave: false,
            saveUninitialized: true
        }
    ));
}

module.exports = MongoSession;