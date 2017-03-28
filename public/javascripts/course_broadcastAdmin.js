/**
 * Created by yangw on 2016/11/24.
 * 课程直播管理员登录页面
 */

/* 页面加载完成后 */
$(function () {

    // 页面事件绑定
    bcAdminAction.pageEventBind();
});

/** 页面全局操作对象
 * broadcastRoom -- 直播房间
 * **/

var bcAdminAction = {
    broadcastRoom: '',
    account: '',
    password: ''
};

/* 页面初始化函数 */
bcAdminAction.pageEventBind = function () {

    // 悬浮按钮初始化
    nojsja.HoverButton.init();
    // 登录按钮绑定
    $('#login').click(bcAdminAction.loginCheck);

};

/* 登录操作 */
bcAdminAction.login = function (callback) {

    // 登录验证地址
    var url = '/course/broadcast/room/adminCheck/' + bcAdminAction.broadcastRoom;
    $.post(url, {

        account: bcAdminAction.account,
        password: bcAdminAction.password
    }, function (JSONdata) {

        callback(JSONdata);
    }, "JSON");
};

/* 登录验证 */
bcAdminAction.loginCheck = function () {

    // 账户名 和 密码
    var account = $('#account').val().trim();
    var password = $('#password').val().trim();
    bcAdminAction.account = account;
    bcAdminAction.password = password;

    if(account && password){
        bcAdminAction.login(loginCallback);
    }else {
        bcAdminAction.modalWindow('请完善用户认证信息...');
    }

    /* 登录回调操作 */
    function loginCallback(JSONdata) {

        var JSONobject = JSON.parse(JSONdata);

        var isError = JSONobject.isError;
        if(isError){
            return bcAdminAction.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 登录验证标志和跳转地址
        var isPass = JSONobject.isPass;
        var url = JSONobject.url || '';

        // 验证通过
        if(isPass){
            window.location.href = url;
        }else {
            bcAdminAction.modalWindow('用户验证信息有误, 请重试...');
        }
    }
};

/* 页面提示模态弹窗 */
bcAdminAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

