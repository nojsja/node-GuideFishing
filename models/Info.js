/**
 * Created by yangw on 2017/5/1.
 * 中英文对照信息模型
 */
/* 公用的mongoose连接 */
var mongoose = require('./tools/Mongoose');
var getDate = require('./tools/GetDate');

/* 信息模式 */
var infoSchema = require('./db_schema/info_schema.js').infoSchema;

/* promise 控制流程 */
var Q = require('q');

/* 构造函数 */
function Info(info) {

    this.info = {
        contentType: info.contentType,
        pattern: info.pattern
    }
}

/* 存储一个中英文对照信息 */
Info.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Info', infoSchema);

    var that = this;
    var query = Model.findOne();
    query.where({
        contentType: that.info.contentType
    });

    query.exec(function (err, doc) {

        if(err){
            console.log(err);
            return callback(err);
        }
        if(doc){

            var flag = false;
            for(let i = 0; i < doc.pattern.length; i++){
                if(doc.pattern[i].english == that.info.pattern.english){
                    flag = true;
                    break;
                }
            }

            if(flag){
                return callback(new Error('已经存在相同的英文标签！').toString());
            }

            var query2 = doc.update({
                $push: {
                    pattern: {
                        english: that.info.pattern.english,
                        china: that.info.pattern.china
                    }
                }
            });

            query2.exec(function (err) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, true);
            });


        }else {

            var newInfo = new Model({
                contentType: that.info.contentType,
                pattern: [{
                    english: that.info.pattern.english,
                    china: that.info.pattern.china
                }]
            });

            newInfo.save(function (err, doc) {

                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, true);
            });
        }
    });
};

/* 获取所有中英文对照 */
Info.getAllPattern = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Info', infoSchema);

    var query = Model.find();
    query.exec(function (err, docs) {

        if(err){
            console.log(err);
            return callback(err);
        }
        // 需要返回的中英文模式对象
        var pattern = {};

        for(let i = 0; i < docs.length; i++){

            docs[i].pattern.forEach(function (_pattern){

                if(!pattern[docs[i].contentType]) {
                    pattern[docs[i].contentType] = {};
                }
                pattern[docs[i].contentType][_pattern.english] = _pattern.china;
            });
        }

        callback(null, pattern);
    });
};

module.exports = Info;