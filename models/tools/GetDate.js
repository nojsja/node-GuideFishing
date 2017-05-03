/**
 * Created by yangw on 2016/11/6.
 * 得到日期
 */

/* 获取当前日期 */
function GetDate() {

    var dateArray = [];
    var date = new Date();
    var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
    var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

    dateArray.push(getMonth, "-", getDate,
        " ", GetTime());

    return (dateArray.join(""));
}

/* 获取当前时间 */
function GetTime() {

    var dateArray = [];
    var date = new Date();
    var getHour = (date.getHours() < 10) ? ("0" + (date.getHours())) : ("" + (date.getHours()));
    var getMinite = (date.getMinutes() < 10) ? ("0" + (date.getMinutes())) : ("" + (date.getMinutes()));
    var getSecond = (date.getSeconds() < 10) ? ("0" + (date.getSeconds())) : ("" + (date.getSeconds()));

    dateArray.push(getHour, ":", getMinite, ":", getSecond);

    return (dateArray.join(""));
}

module.exports = GetDate;