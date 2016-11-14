/**
 * Created by yangw on 2016/11/8.
 * 获取课程详情
 */


$(function () {

    // 开始测试
    $('#startDiv').click(function () {
        window.location.href = "/course/view/" +
            detailAction.courseType + "/" + detailAction.courseName;
    });

    detailAction.courseType = $('.detail-head-type').text().trim();
    detailAction.courseName = $('.detail-head-title').text().trim();
    // 获取类型图片
    detailAction.getTypeImage();

});

/* 页面action对象 */
var detailAction = {
    courseType:　"",
    courseName: ""
};

/* 获取类型图片 */
detailAction.getTypeImage = function () {

    var url = '/course/detail/readTypeImage';
    $.post(url, {}, function (JSONdata) {

        detailAction.updatePage(JSONdata);
    }, "JSON")
};

/* 更新页面 */
detailAction.updatePage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    var imageArray = JSONobject.imageArray;
    var imageUrl = imageArray[detailAction.courseType];
    var backgroundStyle = ["url(", imageUrl, ")", " no-repeat"].join('');
    // 设置图片
    $('.detail-head-img').css({
        'background': backgroundStyle,
        'background-size': 'cover'
    });
};