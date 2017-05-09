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

    // 更新标签
    DetailAction.updateTestTags();

    // 弹幕组件初始化
    nojsja["DanmuColor"].init();

    // 弹幕加载
    DetailAction.getDanmu();

    // 初始化悬浮按钮
    nojsja.HoverButton.init();

    $('#comment').click(function () {

        // dom缓存
        // if(!DetailAction.DOM['comment']){
        //
        //     var $commentDiv = $('<div class="comment-div">');
        //     var $comment = $('<input type="text" id="commentInput" placeholder="请输入弹幕内容...">');
        //     var $commentSend = $('<input type="button" id="commentSend" value="发送">');
        //
        //     // 绑定事件
        //     $commentSend.click(function () {
        //        var comment = $comment.val().trim();
        //        if(comment === '' || comment === null){
        //            return alert('请输入吐槽内容..');
        //        }
        //        DetailAction.sendDanmu({
        //           text: comment,
        //            border: 'red'
        //        });
        //        nojsja["ModalWindow"].hidden();
        //     });
        //
        //     $commentDiv.append($comment)
        //         .append($commentSend);
        //
        //     DetailAction.DOM["comment"] = $commentDiv[0];
        // }

        // nojsja["ModalWindow"].define(DetailAction.DOM["comment"]);
        // nojsja["ModalWindow"].show("弹幕", {
        //     scroll: true,
        //     selfDefineKeep: true
        // });

        // 回调函数
        nojsja["DanmuColor"].show(function (danmuObject) {

            if(danmuObject['text']){

                DetailAction.sendDanmu(danmuObject, function () {
                    nojsja["DanmuColor"].hidden();
                });
            }
        });

    });

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

/* 更新标签 -- DOM 结构
* <span class="tag-item tag-change-animation">标签1</span>
* */
DetailAction.updateTestTags = function () {

    var $detailTagsDiv = $('.detail-tags-div');
    // tag css动画对象 -- 除余法则
    var tagAnimation = {
        0: "tag-item tag-change-reverse-animation",
        1: "tag-item tag-change-animation"
    };
    var index = 1;
    // 字符串转数组
    DetailAction.testTags = DetailAction.testTags.split(',');

    DetailAction.testTags.forEach(function (tag) {

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

/*  发送弹幕 */
DetailAction.sendDanmu = function (danmuInfo, callback) {

    var url = ['/test/','danmu/', DetailAction.testType, '/', DetailAction.testTitle].join('');

    var danmu = nojsja.DanmuPool.get();

    danmuInfo.border = 'red';
    // 弹幕移动
    danmu.move(danmuInfo);

    $.post(url, { danmu: danmuInfo }, function (JSONdata) {

        callback();
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return nojsja["ModalWindow"].show('发送弹幕错误: ' + JSONobject.error);
        }

    }, "JSON");
};

/* 发送加载弹幕请求 */
DetailAction.getDanmu = function () {

    var url = ['/test/','danmu/', DetailAction.testType, '/', DetailAction.testTitle].join('');
    $.get(url, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return nojsja["ModalWindow"].show('加载弹幕错误: ' + JSONobject.error);
        }
        DetailAction.loadDanmu(JSONobject.danmuArray);
    }, "JSON");
};

/* 加载弹幕*/
DetailAction.loadDanmu = function (danmuArray) {

    if(danmuArray.length == 0){
        return;
    }
    // 弹幕测试
    var index = 0;
    var colorArray  = [
        '#eaeaea', '#ff3939',
        '#98f3ff', '#febc54',
        '#2ed66b', '#f2f93a'
    ];

    function danm() {

        var danmu = nojsja.DanmuPool.get();
        // 随机颜色
        danmu.move({
            text: danmuArray[index].text,
            color: danmuArray[index].color || colorArray[nojsja["Tool"].GetRandomNum(0, colorArray.length - 1)]
        });

        index ++;
        if(index < danmuArray.length){
            setTimeout(danm, 1000);
        }
    }
    setTimeout(danm, 1000);
};