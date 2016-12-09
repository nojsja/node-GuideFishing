/**
 * Created by yangw on 2016/11/8.
 * 获取课程详情
 */


$(function () {

    // 开始测试
    $('#startDiv').click(function () {
        window.location.href =
            [ "/course/view/", DetailAction.courseType,
                "/", DetailAction.courseName ].join('');
    });

    DetailAction.courseType = $('.detail-head-type').text().trim();
    DetailAction.courseName = $('.detail-head-title').text().trim();
    // 获取类型图片
    DetailAction.getTypeImage();

});

/* 页面action对象 */
var DetailAction = {
    courseType:　"",
    courseName: ""
};

/* 获取类型图片 */
DetailAction.getTypeImage = function () {

    var url = '/course/detail/readTypeImage';
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        var imageArray = JSONobject.imageArray;
        var imageUrl = imageArray[DetailAction.courseType];
        var backgroundStyle = ["url(", imageUrl, ")", " no-repeat"].join('');
        // 设置图片
        $('.detail-head-img').css({
            'background': backgroundStyle,
            'background-size': 'cover'
        });

    }, "JSON");
};

/* 模态弹窗 */
DetailAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};


































