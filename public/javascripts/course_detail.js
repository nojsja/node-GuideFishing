/**
 * Created by yangw on 2016/11/8.
 * 获取课程详情
 */


$(function () {

    // 更新课程标签
    DetailAction.updateCourseTags();
    // 注意Boolean强制转化

    // 悬浮按钮初始化
    nojsja.HoverButton.init();

    // 状态初始化
    if(DetailAction.isPurchased == "true"){
        $('#start').prop('disabled', false);
        $('#purchase').prop('disabled', "disabled");
    }else {
        if(DetailAction.isPurchased == "unknown"){
            DetailAction.modalWindow("登录后才能进行其它操作 :)");
            $('#purchase').prop('disabled', "disabled");
            $('#start').prop('disabled', "disabled");
        }else {
            $('#purchase').prop('disabled', false);
            $('#start').prop('disabled', "disabled");
        }
    }

    // 查看课程
    $('#start').click(function () {

        // 检查初始化错误
        if(DetailAction.initialError == "true"){
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

/* 更新标签 -- DOM 结构
 * <span class="tag-item tag-change-animation">标签1</span>
 * */
DetailAction.updateCourseTags = function () {

    var $detailTagsDiv = $('.detail-tags-div');
    // tag css动画对象 -- 除余法则
    var tagAnimation = {
        0: "tag-item tag-change-reverse-animation",
        1: "tag-item tag-change-animation"
    };
    var index = 1;
    // 字符串转数组
    DetailAction.courseTags = DetailAction.courseTags.split(',');

    DetailAction.courseTags.forEach(function (tag) {

        var $tagSpan = $('<span>');
        $tagSpan.prop('class', tagAnimation[index++ % 2]);
        $tagSpan.text(tag);

        $detailTagsDiv.append($tagSpan);
    });
};

/* 模态弹窗 */
DetailAction.modalWindow = function(text) {
    njj.ModalWindow.show(text);
};

