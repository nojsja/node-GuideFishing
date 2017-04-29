/**
 * Created by yangw on 2017/3/30.
 * tag标签推荐的相关模式
 */

/* mongoose */
var mongoose = require('./tools/Mongoose.js');
/* db schema */
var tagSchema = require('./db_schema/tag_schema.js').tagSchema;
// 使用promise/defer控制异步流程
var Q = require('q');

/* 构造函数对象 */
function Tag(data) {

    if(data instanceof Array){
        this.tagArray = data;
    }else {
        this.tag = {
            tagName: data.tagName,
            tagType: data.tagType,
            contentType: data.contentType,
            contentName: data.contentName
        };
    }

};

/* 存储一组tag信息 */
Tag.prototype.save = function (callback) {

    var db = mongoose.connection;
    var Model = mongoose.model('Tag', tagSchema);

    var that = this;

    // 存储一组tag信息
    if(that.tagArray){

        // 待并发执行的函数组合
        var tagSaveArray =  [];
        var Q = require('q');

         for(let index in that.tagArray){

             tagSaveArray.push(function () {

                 var defer = Q.defer();
                 console.log(index);
                 saveTag(that.tagArray[index], function (info) {
                     defer.resolve(info);
                 });

                 return defer.promise;
             }());
         }
         // 分别获得各个返回的参数
        Q.all(tagSaveArray).spread(function () {

            for(var item in arguments){
                if(arguments[item].isError){

                    return callback(arguments[item].error);
                }
            }

            callback(null);

        });

    }else {
        // 存储一个tag信息
        saveTag(that.tag, function (info) {
            callback(info);
        });
    }

    function saveTag(tag, callback) {

        var query = Model.findOne();
        query.where({ tagName: tag.tagName });
        query.exec(function (err, doc) {
            if(err){
                console.log('[error]: ' + err);
                return callback({
                    isError: true,
                    error: err
                });
            }
            // 存在tag标记
            if(doc){
                var query2 = doc.update({
                    $push: {
                        tagContent: {
                            tagType: tag.tagType,
                            contentType: tag.contentType,
                            contentName: tag.contentName
                        }
                    }
                });
                query2.exec(function (err, results) {

                    if(err){
                        console.log('[error]: ' + err);
                        return callback({
                            isError: true,
                            error: err
                        });
                    }
                    console.log('saveTag..');
                    return callback({
                        isError: false,
                        error: null
                    });
                });
            }else {
                // 不存在
                var newTag = new Model({
                    tagName: tag.tagName,
                    tagContent: [{
                        tagType: tag.tagType,
                        contentType: tag.contentType,
                        contentName: tag.contentName
                    }]
                });

                newTag.save(function (err, doc) {
                    if(err){
                        console.log("[error]: " + err);
                        return callback({
                            isError: true,
                            error: err
                        });
                    }
                    console.log('saveTag..');
                    return callback({
                        isError: false,
                        error: null
                    });
                });
            }
        });
    }
};

/* 静态方法 */

/* 根据筛选条件返回内容推荐信息 */
Tag.getTagContent = function (condition, callback) {

    var db  = mongoose.connection;
    var Model  = mongoose.model('Tag', tagSchema);

    // 筛选条件：标签类型和条目数，以及需要排除的项目filter
    var tagNameArray = condition.tagNameArray,
        tagTypeArray = condition.tagTypeArray,
        filter = condition.filter || null,
        count = condition.count || 5;

     if( !(tagNameArray && tagTypeArray) ){
        return callback(new Error('查询内容跟有误!'));
     }

     var query = Model.findOne();
     // 复杂的查询条件
     query.where({
         tagName: {$in: tagNameArray},
     });

     // 执行查询
     query.exec(function (err, doc) {

         if(err){
             return callback(err, null);
         }
         var responseData = {};
         // 查询结果
         if(doc){
             // 中断查询
             var breakCondition = tagTypeArray.every(function (item) {
                 return (responseData[item] !== undefined) && (responseData[item].length == count);
             });

             for(let index in doc.tagContent){

                 let _tagType = doc.tagContent[index].tagType;

                 if(tagTypeArray.indexOf(_tagType) >= 0){

                     // 排除要筛选掉的文章
                     if( filter ){

                         if ( doc.tagContent[index].contentType != filter.filterContentType ||
                             doc.tagContent[index].contentName != filter.filterContentName ){

                             if( responseData[_tagType]){

                                 if(responseData[_tagType].length < count){

                                     responseData[_tagType].push({
                                         contentType: doc.tagContent[index].contentType,
                                         contentName: doc.tagContent[index].contentName
                                     });
                                 }

                             }else {
                                 responseData[_tagType] = [{
                                     contentType: doc.tagContent[index].contentType,
                                     contentName: doc.tagContent[index].contentName
                                 }];
                             }
                         }

                     }else {

                         if( responseData[_tagType]){

                             if(responseData[_tagType].length < count){

                                 responseData[_tagType].push({
                                     contentType: doc.tagContent[index].contentType,
                                     contentName: doc.tagContent[index].contentName
                                 });
                             }

                         }else {
                             responseData[_tagType] = [{
                                 contentType: doc.tagContent[index].contentType,
                                 contentName: doc.tagContent[index].contentName
                             }];
                         }
                     }

                 }

                 // 循环中断检查
                 if(breakCondition){
                     break;
                 }
             }
             callback(null, responseData);

         }else {
             callback(null, []);
         }
     });


};

module.exports = Tag;
