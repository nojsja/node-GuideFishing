/**
 * Created by yangw on 2017/3/29.
 */
/**
 * Created by yangw on 2016/11/24.
 * 课程直播管理员登录页面
 */

/* 页面加载完成后 */
$(function () {

    // 页面事件绑定
    // 登录按钮绑定
    $('#login').click(AdminLogin.loginCheck);
});


var AdminLogin = {
    account: '',
    password: ''
};

/* 登录操作 */
AdminLogin.login = function (callback) {

    // 登录验证地址
    var url = "/admin/login";
    $.post(url, {
        account: AdminLogin.account,
        password: AdminLogin.password
    }, function (JSONdata) {

        callback(JSONdata);
    }, "JSON");
};

/* 登录验证 */
AdminLogin.loginCheck = function () {

    // 账户名 和 密码
    var account = $('#account').val().trim();
    var password = $('#password').val().trim();
    AdminLogin.account = account;
    AdminLogin.password = password;

    if(account && password){
        AdminLogin.login(loginCallback);
    }else {
        AdminLogin.modalWindow('请完善用户认证信息...');
    }

    /* 登录回调操作 */
    function loginCallback(JSONdata) {

        var JSONobject = JSON.parse(JSONdata);

        var isError = JSONobject.isError;
        if(isError){
            return AdminLogin.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 登录验证标志和跳转地址
        var pass = JSONobject.pass;

        // 验证通过
        if(pass){
            window.location.href = JSONobject.redirectUrl;
        }else {
            AdminLogin.modalWindow('用户验证信息有误, 请重试...');
        }
    }
};

/* 页面提示模态弹窗 */
AdminLogin.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

