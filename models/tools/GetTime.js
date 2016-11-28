/**
 * Created by yangw on 2016/11/28.
 * 获取当前时间
 */

function getTime() {

    var date = new Date();
    var dateArray = [];
    dateArray.push("[ ", date.getHours(), ":", date.getMinutes(), ":",
        date.getSeconds(), " ] ");

    return dateArray.join('');
}

module.exports = getTime;