/**
 * Created by yangw on 2016/10/19.
 * 测评题目详情介绍页面,
 * 可以获取某一个测评集合的详细信息,
 * 把轮廓题目类型,描述,创建日期,点击量等等
 */

$(function () {

    if(DetailAction.initialError == "true"){
        DetailAction.modalWindow('[error]:' + DetailAction.error);
    }

    // 初始化悬浮按钮
    nojsja.HoverButton.init();


    // 注意Boolean强制转化
    // 状态初始化，检测用户登录状态和购买状态
    /*if(DetailAction.isPurchased == "true"){
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
    }*/

    // 查看课程
    $('#start').click(function () {

        // 检查初始化错误
        if(DetailAction.initialError == "true"){
            return DetailAction.modalWindow('页面载入出错，请刷新！');
        }
        window.location.href =
            [ "/test/view/", DetailAction.testType,
                "/", DetailAction.testTitle ].join('');
    });

    // 购买课程
    /*$('#purchase').click(function () {

        var url = '/purchase/test';
        $.post(url, {
            itemName: DetailAction.testTitle,
            itemType: DetailAction.testType
        }, function (JSONdata) {

            var JSONobject = JSON.parse(JSONdata);
            if(JSONobject.isError){
                return DetailAction.modalWindow(JSONobject.error);
            }
            $('#start').prop('disabled', false);
            $('#purchase').prop('disabled', 'disabled');
        });
    });*/

    // 获取类型图片
    DetailAction.getTypeImage();

});

/* 页面action对象
 * isPurchased -- 当前课程的购买状态
 * initialError -- 页面初始化错误状态
 * */
var DetailAction = {

};

/* 获取类型图片 */
DetailAction.getTypeImage = function () {

    var url = '/test/detail/readTypeImage';
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        var imageArray = JSONobject.imageArray;
        var imageUrl = imageArray[DetailAction.testType];
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


