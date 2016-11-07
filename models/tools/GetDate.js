/**
 * Created by yangw on 2016/11/6.
 * 得到日期
 */

function getDate() {

    var dateArray = [];
    var date = new Date();
    var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
    var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

    dateArray.push(date.getFullYear(), "-", getMonth, "-", getDate,
        " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

    return (dateArray.join(""));
}

module.exports = getDate;