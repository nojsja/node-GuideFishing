/**
 * Created by yangw on 2016/11/3.
 * 将服务器testType文件夹中的所有图片读出来
 * 组合成图片imgurl对象
 */
// 文件操作
var fs = require('fs');

/* 读取磁盘类型图片 */
/**
 *  参数类型:
 *  readUrl -- d*/
function readTypeImg(readurl, visitUrl, callback) {

    // 存储图片地址的对象
    var urlImgObj = {};
    fs.readdir(readurl, function (err, files) {
        if(err){
            callback(null);
            return console.log(err);
        }
        for(var i in files){
            var fileName = files[i];
            urlImgObj[fileName.split('.')[0]] = visitUrl + fileName;
        }
        // 回调返回数据
        callback(urlImgObj);
    });
}

module.exports = readTypeImg;