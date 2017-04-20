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
            $('#purchase').prop('disabled', "disabled");
            $('#start').prop('disabled', "disabled");

            // 弹出登录窗口
            DetailAction.userLogin();
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
            DetailAction.isPurchased = true;
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
  * DOM -- 需要缓存的DOM对象
  * */
var DetailAction = {
    courseType:　"",
    courseName: "",
    isPurchased: false,
    initialError: false,
    error: null,
    DOM: {}
};

/* 弹出登录窗口
 * <div class="detail-login-div">
 <input type="text" class="login-account" id="loginAccount" placeholder="请输入账户...">
 <input type="text" class="login-password" id="loginPassword" placeholder="请输入密码...">
 <div class="button login-button" id="loginButton">登录</div>
 <div class="button signup-button" id="signupButton">注册</div>
 </div>
  * */
DetailAction.userLogin = function () {

    if(!DetailAction.DOM.userLogin){

        var $detailLoginDiv = $('<div class="detail-login-div">');
        var $loginAccount = $('<input type="text" class="login-account" id="loginAccount" placeholder="请输入账户...">');
        var $loginPassword = $(' <input type="text" class="login-password" id="loginPassword" placeholder="请输入密码...">');
        var $loginButton = $(' <div class="button login-button" id="loginButton">登录</div>');
        var $signupButton = $(' <div class="button signup-button" id="signupButton">注册</div>');
        // 绑定事件
        $loginButton.click(function () {

            var account = $loginAccount.val().trim();
            var password = $loginPassword.val().trim();
            var url = '/user/login';

            if(account == '' || password == ''){
                return alert('请填入完整的登录信息~');
            }

            $.post('/login', {
                account: account,
                password: password
            }, function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                if(JSONobject.isError){
                    return alert('发生错误：' + JSONobject.error);
                }
                if(JSONobject.pass){
                    // 重载页面
                    window.location.reload();
                }else {
                    alert('登录失败！密码与账户不匹配');
                }
            }, "JSON");

        });

        $signupButton.click(function () {

            window.location.href = '/login';
        });

        // 添加DOM
        $detailLoginDiv.append($loginAccount)
            .append($loginPassword)
            .append($loginButton)
            .append($signupButton);

        // 缓存DOM
        DetailAction.DOM.userLogin = $detailLoginDiv[0];
    }

    nojsja["ModalWindow"].define(DetailAction.DOM.userLogin);
    nojsja["ModalWindow"].show('验证账户', {
        scroll: true,
        selfDefineKeep: true
    });
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

