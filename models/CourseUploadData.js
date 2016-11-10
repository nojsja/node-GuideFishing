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
// 文件模式
var fileSchema = require('./db_schema/file_schema').fileSchema;


/* 构造函数 */
function CourseUploadData(type, data) {

    // 安全监测措施, 防止非对象式调用
    if(this instanceof CourseUploadData){
        // 数据媒体类型
        this.mediaType = type;
        // 数据表存储的数据
        this.data = data;
        // 绑定数据模型
        this.schema = this.typeStorage[this.mediaType].schema ||
            this.typeStorage['file'].schema;
        // 模型名字
        this.model = this.typeStorage[this.mediaType].model ||
                this.typeStorage['file'].model;
    }else {
        return new CourseUploadData(type, data);
    }
}

/* 将多媒体数据存储到数据库 */
CourseUploadData.prototype.save = function (callback) {

    var data = this.data;
    var schema = this.schema;
    var model = this.model;

    var db = mongoose.connect('mongodb://localhost/QN');
    var Model = mongoose.model(model, schema);
    
    mongoose.connection.once('open', function () {

        console.log('mongodb open.');
        var newMode = new Model(data);
        newMode.save(function (err, doc) {
            if(err){
                console.log('mongodb error.');
                console.log(err);
                mongoose.disconnect();
                return callback(err);
            }
            console.log('mongodb success.');
            console.log('doc:'+ doc);
            // 成功返回
            mongoose.disconnect();
            return callback(null);
        });
    });
};

/* 存储对象信息映射 */
CourseUploadData.prototype.typeStorage = {

    image: {
        schema: imageSchema,
        model: "Image"
    },
    video: {
        schema: videoSchema,
        model: "Video"
    },
    audio: {
        schema: audioSchema,
        model: "Audio"
    },
    file: {
        schema: fileSchema,
        model: "File"
    }
};

/* 上传数据预览 */
CourseUploadData.previewData = function (condition, callback) {

    // 组装预览条件对象
    var previewCondition = {};
    if(!(condition.type && condition.courseName)){
        var error = new Error('确认完整的预览条件,包括预览类型和课程名', '00');
        return callback(error, null);
    }

    // 查找类型和存储数据的容器
    var type = condition.type;
    var dataArray = [];

    // 数据库信息
    var modelName = CourseUploadData.prototype.typeStorage[type].model;
    var schema = CourseUploadData.prototype.typeStorage[type].schema;

    previewCondition.courseName = condition.courseName;

    var db = mongoose.connect('mongodb://localhost/QN');
    var model = mongoose.model(modelName, schema);

    mongoose.connection.once('open', function () {

        var query = model.find();
        query.where(previewCondition);
        /* 选择对象的名字和地址 */
        query.select({
            name: 1,
            url: 1
        });
        query.exec(function (err, docs) {
            if(err){
                console.log(err);
                mongoose.disconnect();
                return callback(err, null);
            }
            console.log("数据长度:" + docs.length);
            // 遍历筛选数据
            for(var index in docs){
                var doc = docs[index];
                dataArray.push({
                    name: doc.name,
                    url: doc.url
                });
            }
            mongoose.disconnect();
            callback(null, dataArray);
        });
    });
};

module.exports = CourseUploadData;



















































