/**
 * Created by yangw on 2016/11/9.
 * 存储编辑页面课程上传时保存各种数据.
 * 包括图片, 音频和视频数据
 */

var mongoose = require('mongoose');
// 图片模式
var imageSchema = require('./db_schema/image_schema').imageSchema;
// 音频模式
var audioSchema = require('./db_schema/audio_schema').audioSchema;
// 视频模式
var videoSchema = require('./db_schema/video_schema').videoSchema;



/* 构造函数 */
function CourseUploadData(type, data) {

    // 安全监测措施, 防止非对象式调用
    if(this instanceof CourseUploadData){
        // 数据媒体类型
        this.mediaType = type;
        // 数据表存储的数据
        this.data = data;
        // 绑定数据模型
        this.schema = this.typeStorage[this.mediaType].schema;
    }else {
        return new CourseUploadData(type, data);
    }
}

/* 将多媒体数据存储到数据库 */
CourseUploadData.prototype.save = function (callback) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Model = mongoose.model('Model', this.schema);
    
    mongoose.connection.once('open', function () {

        var newMode = new Model(this.data);
        newMode.save(function (err, doc) {
            if(err){
                mongoose.disconnect();
                console.log(err);
                return callback(err);
            }
            // 成功返回
            mongoose.disconnect();
            return callback(null);
        });
    });
};

/* 存储对象信息工厂 */
CourseUploadData.prototype.typeStorage = {

    image: {
        schema: imageSchema
    },
    video: {
        schema: videoSchema
    },
    audio: {
        schema: audioSchema
    }
};




module.exports = CourseUploadData;
