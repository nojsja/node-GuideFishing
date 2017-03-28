/**
 * Created by yangw on 2017/3/13.
 */

/* 初始化操作 */
$(function () {
    $('#nameCheck').toggle("fast");
    $('#pswCheckGroup').toggle("fast");
    //绑定事件
    $('#rememberPsw').click(function() {
        if ($('#rememberPsw').prop("checked") === true){
            loginAction.rememberPsw = true;
        }else {
            loginAction.rememberPsw = false;
        }
    });
    $('.choose-div-button').click(function() {

        $('.choose-div-button').prop('class', 'choose-div-button');
        $(this).prop('class', 'choose-div-button choose-div-button-click');
        var action = $(this).attr('action');
        if(action == "login"){
            $('#nameCheck').slideUp("slow");
            $('#pswCheckGroup').slideUp("slow");
            loginAction.state = "login";
            loginAction.urlLogin = "/login";
        }else {
            $('#nameCheck').slideDown("slow");
            $('#pswCheckGroup').slideDown("slow");
            loginAction.state = "signup";
            loginAction.urlLogin = "/signup";
        }
    });
    //登录检测
    $('#ok').click(function() {

        // 检查状态
        check.start();
        if(!loginAction.checkStatus.emailStatus){
            loginAction.modalWindow("邮箱格式不对额!");
            return;
        }
        if(!loginAction.checkStatus.pswStatus){
            loginAction.modalWindow("密码格式有错额!");
            return;
        }
        if(!loginAction.checkStatus.RePswStatus && (loginAction.state == "signup")){
            loginAction.modalWindow("两次填写的密码不同额!");
            return;
        }
        if( !loginAction.userInfo.nickName && (loginAction.state === "signup") ){
            loginAction.modalWindow("至少要填一下你的昵称吧!");
            return;
        }

        var back = (loginAction.state === "login") ? loginAction.login() : loginAction.signup();
    });

    /* 格式检测函数 */
    var check = (function(){

        //邮箱检测
        $('#email').blur(emailCheck);
        // 非法字符检测
        $('#password').blur(passwordCheck);
        // 姓名赋值
        $('#nickName').blur(nickNameCheck);
        // 密码一致性检查
        $('#pswCheck').blur(pswRepeatCheck);

        // 邮箱检查函数
        function emailCheck() {

            if( charaAction.emailCheck( $('#email').val().trim() ) ){
                $('#emailStatus').attr({"class" : "glyphicon glyphicon-ok"});
                loginAction.checkStatus.emailStatus = true;
                loginAction.userInfo.account = $('#email').val().trim();
            }else {
                $('#emailStatus').attr({"class" : "glyphicon glyphicon-remove"});
                loginAction.checkStatus.emailStatus = false;
            }
        }
        
        // 昵称输入检查
        function nickNameCheck() {
            var nickName = $('#nickName').val().trim();
            if( charaAction.charaCheck(nickName) ){
                loginAction.userInfo.nickName = $('#nickName').val().trim();
                $('#nameStatus').attr({"class" : "glyphicon glyphicon-ok"});
            }else {
                $('#nameStatus').attr({"class" : "glyphicon glyphicon-remove"});
            }
        }

        // 密码非法字符检查函数
        function passwordCheck() {

            if( charaAction.charaCheck($('#password').val().trim()) ){
                $('#pwdStatus').attr({"class" : "glyphicon glyphicon-ok"});
                loginAction.checkStatus.pswStatus = true;
                loginAction.userInfo.password = $('#password').val().trim();
            }else {
                $('#pwdStatus').attr({"class" : "glyphicon glyphicon-remove"});
                loginAction.checkStatus.pswStatus = false;
            }
        }

        //密码一致性检查
        function pswRepeatCheck() {

            if( ($('#password').val() == $('#pswCheck').val()) && ($('#password').val().trim() !== "") ){
                $('#rePswStatus').attr({"class" : "glyphicon glyphicon-ok"});
                loginAction.checkStatus.RePswStatus = true;
            }else {
                $('#rePswStatus').attr({"class" : "glyphicon glyphicon-remove"});
                loginAction.checkStatus.RePswStatus = true;
            }
        }

        // 返回调用接口
        return {
            start: function () {
                emailCheck();
                nickNameCheck();
                pswRepeatCheck();
                passwordCheck();
            }
        }
    })();

    /* 初始化悬浮按钮 */
    nojsja.HoverButton.init();

});

/* 页面state对象
 * urlLogin -- 提交到的后台url
  * state  -- 登录或注册
  * isRemember -- 是否记住密码
  * userInfo -- 提交的用户信息
  * checkStatus -- 登录检查状态
  * */
var loginAction = {

    urlLogin : "/login",
    state : "login",
    isRemember: false,
    userInfo: {
        account: null,
        password: null,
        nickName: null
    },
    checkStatus: {
        emailStatus : false,
        pswStatus : false,
        RePswStatus : false,
        rememberPsw : false
    }
};

/* 字符检测对象 */
var charaAction = {
    /* 非法字符检测 */
    charaCheck: function(text) {
        if(text === ""){
            return false;
        }
        //正则匹配
        var pattern = /[\\*@$%^#/]/;
        if(pattern.test(text)){
            return false;
        }else {
            return true;
        }
    },

    /* 邮箱格式检测 */
    emailCheck: function (text) {
        var pattern = /[0-9a-zA-Z]+@[0-9a-zA-Z]+.\w+/;
        //正则匹配
        if(pattern.test(text)){
            return true;
        }else {
            return false;
        }
    }
};

/* 模态弹窗 */
loginAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

/* 登录操作 */
loginAction.login = function() {

    $.post(loginAction.urlLogin, {
        action : loginAction.state,
        account : loginAction.userInfo.account,
        password : loginAction.userInfo.password,
        isRemember : loginAction.rememberPsw
    }, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return loginAction.modalWindow('发生错误：' + JSONobject.error);
        }
        if(JSONobject.pass){
            // 注册成功
            window.history.go(-1);
        }else {
            // 注册失败
            loginAction.modalWindow('用户名或是密码输入错误！');
        }
    }, "JSON");
};

/* 注册操作 */
loginAction.signup = function() {

    $.post(loginAction.urlLogin, {
        action : loginAction.state,
        account : loginAction.userInfo.account,
        password : loginAction.userInfo.password,
        nickName : loginAction.userInfo.nickName,
        isRemember : loginAction.rememberPsw

    }, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return loginAction.modalWindow('发生错误：' + JSONobject.error);
        }
        if(JSONdata.pass){
            // 注册成功
            window.history.go(-1);
        }else {
            // 注册失败
            loginAction.modalWindow('抱歉，用户名已经被占用！');
        }
    }, "JSON");
};