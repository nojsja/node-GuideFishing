/**
 * Created by yangw on 2016/11/8.
 * 获取课程详情
 */


$(function () {

    // 状态初始化
    if(DetailAction.isPurchased){
        $('#start').prop('disabled', false);
    }else {
        $('#purchase').prop('disabled', false);
    }

    // 查看课程
    $('#start').click(function () {

        // 检查初始化错误
        if(DetailAction.initialError){
            return DetailAction.modalWindow('页面载入出错，请刷新！');
        }
        window.location.href =
            [ "/course/view/", DetailAction.courseType,
                "/", DetailAction.courseName ].join('');
    });

    // 购买课程
    $('#purchase').click(function () {
        
        var url = '/purchase/course';
        $.post(url, {
            itemName: DetailAction.courseName,
            itemType: DetailAction.courseType
        }, function (JSONdata) {

            var JSONobject = JSON.parse(JSONdata);
            if(JSONobject.isError){
                return DetailAction.modalWindow(JSONobject.error);
            }
            $('#start').prop('disabled', false);
            $('#purchase').prop('disabled', 'disabled');
        });
    });

    /*DetailAction.courseType = $('.detail-head-type').text().trim();
    DetailAction.courseName = $('.detail-head-title').text().trim();*/
    // 获取类型图片
    DetailAction.getTypeImage();

});

/* 页面action对象
 * isPurchased -- 当前课程的购买状态
  * initialError -- 页面初始化错误状态
  * */
var DetailAction = {
    /*courseType:　"",
    courseName: "",
    isPurchased: false,
    initialError: false,
    error: null*/
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
    njj.ModalWindow.show(text);
};


































