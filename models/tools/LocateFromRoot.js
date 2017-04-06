/**
 * Created by yangw on 2016/11/14.
 * 获取根目录的工具模块
 */

var getRoot = require('../../LOCATE_FILE');

var LocateFromRoot = function(relative_path) {

    // 目录数组
    var dirArray = [];
    dirArray.push(getRoot, relative_path);
    // 返回路径字符串
    return   dirArray.join('');
};

module.exports = LocateFromRoot;