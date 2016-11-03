/**
 * Created by yangw on 2016/11/3.
 * 将服务器testType文件夹中的所有图片读出来
 * 组合成图片imgurl对象
 */
// 文件操作
var fs = require('fs');

// 读取服务器磁盘
function readTestType(callback) {
    var url = './public/images/testType';
    // 存储图片地址的对象
    var urlImgObj = {};
    fs.readdir(url, function (err, files) {
        if(err){
            return console.log(err);
        }
        for(var i in files){
            var fileName = files[i];
            urlImgObj[fileName.split('.')[0]] = '/images/testType/' + fileName;
        }
        // 回调返回数据
        callback(urlImgObj);
    });
}

module.exports = readTestType;