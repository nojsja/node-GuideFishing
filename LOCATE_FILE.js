/**
 * Created by yangw on 2016/11/14.
 * 模块主要用于获取根目录
 */

var GetRoot = (function() {

    // 返回当前目录也就是根目录
    return __dirname;
})();

module.exports = GetRoot;