/**
 * Created by yangw on 2017/3/13.
 */
/**
 * Created by yangw on 2016/8/18.
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
    $('#signupTitle').click(function() {
        $('#action').text("用户注册");
        $('#nameCheck').slideDown("slow");
        $('#pswCheckGroup').slideDown("slow");
        loginAction.state = "signup";
    });

    $('#loginTitle').click(function() {
        $('#action').text("用户登录");
        $('#nameCheck').slideUp("slow");
        $('#pswCheckGroup').slideUp("slow");
        loginAction.state = "login";
    });

    //绑定检查的事件
    check();
    //登录检测
    $('#ok').click(function() {
        if(!loginAction.emailStatus){
            loginAction.modalWindow("邮箱格式不对额!");
            return;
        }
        if(!loginAction.pswStatus){
            loginAction.modalWindow("密码格式有错额!");
            return;
        }
        if(!loginAction.RePswStatus && (loginAction.state == "signup")){
            loginAction.modalWindow("两次填写的密码不同额!");
            return;
        }
        if(($('#name').val() === "") && (loginAction.state === "signup")){
            loginAction.modalWindow("至少要填一下你的昵称吧!");
            return;
        }
        var back = (loginAction.state === "login") ? loginAction.loginAction() : loginAction.signupAction();
    });
});

/* 页面state对象 */
var loginAction = {

    urlLogin : "/login",
    state : "login",
    account: "",
    password : "",
    emailStatus : false,
    pswStatus : false,
    RePswStatus : false,
    rememberPsw : false
};

/* 字符检测对象 */
var charaAction = {};

/* 加载头像请求 */
loginAction.loadHeadImg = function() {

    $.post(loginAction.urlLogin, {
            action:"loadHeadImg"
        }, function (JSONdata) {
            loginAction.loadImgAction(JSONdata);
        }, "JSON"
    );
};

/* 模态弹窗 */
loginAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show",{
        backdrop:true,
        keyboard:true
    });
};

/* 加载头像操作 */
loginAction.loadImgAction = function(JSONdata) {

    //头像根目录
    var baseUrl = JSONdata.baseUrl;
    if (JSONdata.images === null){
        loginAction.modalWindow("服务器错误!请刷新..");
        return;
    }
    var images = JSONdata.images;
    for (var i = 0; (images[i] !== null && images[i] !== undefined); i++){
        var image = images[i];
        var $imgDiv = $("<div></div>");
        var $img = $("<img>");
        $img.attr({
            "src" : baseUrl + image,
            "class" : "login-icon"
        });
        $imgDiv.append($img);
        $('.icon-div').append($imgDiv);
    }
};

/* 登录操作 */
loginAction.loginAction = function() {

    $.post(loginAction.urlLogin, {
            action : loginAction.state,
            email : loginAction.email,
            password : loginAction.password,
            isRemember : loginAction.rememberPsw
        }, function (JSONdata) {
            if(JSONdata.status != "ok"){
                loginAction.modalWindow(JSONdata.statusText);
            }else {
                //跳转到主页
                window.location.href = JSONdata.url;
            }
        }, "JSON"
    );
};

/* 注册操作 */
loginAction.signupAction = function() {

    $.post(loginAction.urlLogin,
        {
            action : loginAction.state,
            email : loginAction.email,
            password : loginAction.password,
            name : loginAction.name,
            isRemember : loginAction.rememberPsw
        },
        function (JSONdata) {
            if(JSONdata.status != "ok"){
                loginAction.modalWindow(JSONdata.statusText);
            }else {
                loginAction.modalWindow(JSONdata.statusText);
            }
        }, "JSON"
    );
};

/* 格式检测函数 */
var check = function(){

    //邮箱检测
    $('#email').blur(function() {
        if( charaAction.emailCheck($('#email').val()) ){
            $('#emailStatus').attr({"class" : "glyphicon glyphicon-ok"});
            loginAction.emailStatus = true;
            loginAction.email = $('#email').val();
        }else {
            $('#emailStatus').attr({"class" : "glyphicon glyphicon-remove"});
            loginAction.emailStatus = false;
        }
    });

    //非法字符检测
    $('#password').blur(function() {
        if( charaAction.charaCheck($('#password').val()) ){
            $('#pwdStatus').attr({"class" : "glyphicon glyphicon-ok"});
            loginAction.pswStatus = true;
            loginAction.password = $('#password').val();
        }else {
            $('#pwdStatus').attr({"class" : "glyphicon glyphicon-remove"});
            loginAction.pswStatus = false;
        }
    });

    $('#name').blur(function() {
        loginAction.name = $('#name').val();
    });

    $('#pswCheck').blur(function() {
        if( ($('#password').val() == $('#pswCheck').val()) && ($('#password').val() !== "") ){
            $('#rePswStatus').attr({"class" : "glyphicon glyphicon-ok"});
            loginAction.RePswStatus = true;
        }else {
            $('#rePswStatus').attr({"class" : "glyphicon glyphicon-remove"});
            loginAction.RePswStatus = true;
        }
    });
};

/* 非法字符检测 */
charaAction.charaCheck = function(text) {

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
};

/* 邮箱格式检测 */
charaAction.emailCheck = function (text) {

    var pattern = /[0-9a-zA-Z]+@[0-9a-zA-Z]+.\w+/;
    //正则匹配
    if(pattern.test(text)){
        return true;
    }else {
        return false;
    }
};