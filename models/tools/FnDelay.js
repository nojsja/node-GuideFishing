/**
 * Created by yangw on 2017/2/19.
 */

var FnDelay = (function FnDelay(){

    //采用单例模式进行内部封装
    // 存储所有需要调用的函数
    var fnObject = {};

    // 三个参数分别是被调用函数，设置的延迟时间，是否需要立即调用
    return function(fn, delayTime, IsImediate){

        // 立即调用
        if(!delayTime || IsImediate){
            return fn();
        }

        // 判断函数是否已经在调用中
        if(fnObject[fn]){
            return;
        }else {
            // 定时器
            var timer = setTimeout(function(){
                fn();
                //清除定时器
                clearTimeout(timer);
                delete(fnObject[fn]);
            }, delayTime);

            fnObject[fn] = {
                "status": 'waitToRun',
                "delayTime": delayTime,
                "timer": timer
            };

        }
    };
})();

module.exports = FnDelay;