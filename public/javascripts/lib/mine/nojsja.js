/**
 * Created by yangw on 2017/2/22.
 * 存储自己的函数库
 */

(function () {

    /** 存储自定义方法 **/
    var MODULE_MAP = {};

    /** 被引用的作用域内部变量 **/
    var nojsja = {};

    /** 暴露的全局变量 **/
    window.nojsja = window.njj = nojsja;

    /* 定义模块 */
    nojsja["define"] = function (name, developments, implements) {

        if(typeof implements != 'function'){
            return false;
        }
        for(var i = 0; i < developments.length; i++){
            // 将module名字转化为module引用
            developments[i] = MODULE_MAP[developments];
        }
        // 添加模块
        MODULE_MAP[name] = implements.apply(implements, developments);
        return true;
    };

    /* 获取模块 */
    nojsja["get"] = function (name) {
        return MODULE_MAP[name];
    };

    /* 删除模块 */
    nojsja["delete"] = function (name) {
        if(MODULE_MAP[name]){
            delete MODULE_MAP[name];
            return true;
        }
        return false;
    };

    /* Ajax调用池 */
    nojsja["AjaxPool"] = (function() {

        //缓存XMLHttpRequest对象的数组
        var XMLHttpRequestPool = [];

        //方法返回一个XMLHttpRequest对象
        var getInstance = function() {
            for(var i = 0; i < XMLHttpRequestPool.length; i++) {
                //如果当前的请求对象空闲

                if(XMLHttpRequestPool[i].readyState == 0) {

                    return XMLHttpRequestPool[i];
                }
            }

            //如果没有空闲的
            XMLHttpRequestPool[XMLHttpRequestPool.length] = createXMLHttpRequest();
            return XMLHttpRequestPool[XMLHttpRequestPool.length - 1];
        };

        //创建XMLHttpRequest对象
        var createXMLHttpRequest = function () {

            if(window.XMLHttpRequest){
                var objXMLHttp = new XMLHttpRequest();
            }else{
                //将IE中内置的所有XMLHTTP ActiveX设置成数组
                var MSXML = ['MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0',
                    'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];

                for(var n = 0; n < MSXML.length; n++) {
                    try{
                        var objXMLHttp = new ActiveXObject(MSXML[n]);
                        break;
                    }catch (e){
                        alert(e);
                    }
                }
            }

            //Mozilla某些版本没有Readystate属性
            if(objXMLHttp.readyState == null) {
                //手动置为未初始化状态
                objXMLHttp = 0;
                //对于没有readystate属性的浏览器，将load动作与下面的函数关联起来
                objXMLHttp.addEventListener("load", function(){
                    //等服务器的数据加载完成后，将readyState设为4
                    objXMLHttp.readyState = 4;
                    if(typeof objXMLHttp.onreadystatechange == "function"){
                        objXMLHttp.onreadystatechange();
                    }
                },false);
            }
            return objXMLHttp;
        };

        //发送请求
        var sendRequest = function(method, url, data, callback){

            var objXMLHttp = getInstance();

            try{
                //增加一个额外的请求参数，防止IE缓存服务器响应
                if(url.indexOf("?") > 0){
                    url += "&randnum=" + Math.random();
                }else{
                    url += "?randnum=" + Math.random();
                }
                //打开服务器连接
                open(method, url, true);
                if(method == "POST"){
                    objXMLHttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                    objXMLHttp.send(data);
                    /*//设置超时2.5分钟
                     setTimeout(function(){
                     if(objXMLHttp.readyState != 4 && objXMLHttp.readyState != 0){
                     alert("ajax响应超时");
                     objXMLHttp.abort();
                     }
                     }, "121000");*/
                }
                if(method == "GET"){
                    objXMLHttp.send(null);
                }

                //设置状态改变的回调函数
                objXMLHttp.onreadystatechange = function () {
                    if(objXMLHttp.readyState == 4 &&
                        (objXMLHttp.status == 200 || objXMLHttp.status == 304)){

                        //服务器响应完成
                        callback.call(null, objXMLHttp);
                        //手动置为不可使用状态，加锁
                    }
                };
            }catch (e){
                alert(e);
            }
        }

        // 返回调用接口
        return {
            createXMLHttpRequest: createXMLHttpRequest,
            sendRequest: sendRequest
        }
    })();

    /* 观察者模式方法 */
    nojsja["ObserverPattern"] = function () {

        // 观察者初始化
        function observerInit(object) {
            // 定义分数模式的观察者回调函数
            object.watcherList = [];
            // 为分数模式注册新的观察者
            object.listen = function (fn) {
                object.watcherList.push(fn);
            };
            // 被观察者事件触发
            object.trigger = function () {
                for(var index in object.watcherList){
                    object.watcherList[index].apply(object);
                }
            };
            // 解绑观察者事件监听
            object.remove = function (fn) {
                var length = object.watcherList.length;
                for(var i = length - 1; i >= 0; i-- ){
                    if(fn === object.watcherList[i]){
                        object.watcherList.splice(i, 1);
                    }
                }
            };
        }

        return {
            init: observerInit
        }
    };

    /* 获取鼠标当前相对于document的绝对坐标 */
    nojsja["GetMousePosition"] = function (event) {

        var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.pageX || (e.clientX + scrollX);
        var y = e.pageY || (e.clientY + scrollY);

        // 返回坐标对象, 即相对于top和left的位置距离
        return { x: x, y: y };
    };

    /* 模态弹窗方法 */
    nojsja["ModalWindow"] = (function () {
        // 初始化标志
        var isInit = false;
        var modal, modalContent, acceptButton, contentP, selfDefineDiv;

        // 组件初始化事件
        function modalInit() {
            isInit = true;
            // 整个弹窗组件
            modal = document.getElementById('ModalWindow');
            // 显示的主要内容
            modalContent = document.getElementById('ModalContent');
            acceptButton = document.getElementById('accept');
            // 显示的文字信息
            contentP = document.getElementById('contentText');
            // 自定义组件的父级div
            selfDefineDiv = document.getElementById('selfDefineDiv');

            // 绑定点击关闭事件
            acceptButton.onclick = function () {
                modalHidden();
            };
        }

        // 模态窗口弹出
        function modalShow(text, condition) {

            // 初始化检测
            if(!isInit){
                modalInit();
            }

            // 禁用窗口的滚动事件，这儿其实应该阻止事件冒泡
            // 可以手动传参设置可不可滚动
            if(!condition || !condition.scroll){

                nojsja.ScrollHandler.disableScroll();
            }

            // 清除自定义DOM
            if(!condition || !condition.selfDefineKeep){

                selfDefineRemove();
            }

            contentP.innerText = text;
            // 设置透明度和初始位置
            modalContent.style.opacity = 0;
            // 注意'px'两个字符还要占用两个长度，这是字符串转化为数字
            modalContent.style.top =
                Number(modalContent.style.top.substr(0, modalContent.style.top.length - 2)) + 20 + 'px';

            var opacityValue = 0.0;
            modal.style.display = 'block';
            // 弹出动画效果
            // 注意JavaScript中小数想加的时候可能会舍去
            function popAnimation() {
                if(modalContent.style.opacity == 1){
                    return;
                }else {
                    opacityValue += 5.0;
                    var topValue = Number(modalContent.style.top.substr(0, modalContent.style.top.length - 2));
                    // 动画函数一共会调用20次
                    modalContent.style.top = topValue - ( 20 / (100 / 5))  + 'px';
                    modalContent.style.opacity = opacityValue / 100;

                    // 递归调用
                    setTimeout(popAnimation, 10);
                }
            }
            setTimeout(popAnimation, 10);
        }

        /* 添加自定义组件到modalWindow */
        function selfDefine(defineHtml) {

            if(!isInit){
                modalInit();
            }

            selfDefineRemove();

            selfDefineDiv.appendChild(defineHtml);
        }

        /* 清除自定义组件 */
        function selfDefineRemove() {
            for(var i = 0; i < selfDefineDiv.childNodes.length; i++){
                selfDefineDiv.removeChild(selfDefineDiv.childNodes[0]);
            }
        }
        
        // 模态窗口隐藏
        function modalHidden() {

            // 初始化检测
            if(!isInit){
                modalInit();
            }

            // 启用滚动
            nojsja.ScrollHandler.enableScroll();

            // 设置透明度和初始位置
            modalContent.style.opacity = 1;
            // 注意'px'两个字符还要占用两个长度，这是字符串转化为数字

            var opacityValue = 100.0;
            // 弹出动画效果
            // 注意JavaScript中小数想加的时候可能会舍去
            function pushAnimation() {
                if(modalContent.style.opacity == 0){
                    modal.style.display = 'none';
                    modalContent.style.top = 0 + 'px';
                    return;
                }else {
                    opacityValue -= 5.0;
                    var topValue = Number(modalContent.style.top.substr(0, modalContent.style.top.length - 2));
                    // 动画函数一共会调用20次
                    modalContent.style.top = topValue + ( 20 / (100 / 5))  + 'px';
                    modalContent.style.opacity = opacityValue / 100;

                    // 递归调用
                    setTimeout(pushAnimation, 10);
                }
            }
            setTimeout(pushAnimation, 10);
        }

        // 返回调用接口
        return {
            show: modalShow,
            define: selfDefine,
            hidden: modalHidden
        }
    })();

    /* 图片轮播组件 */
    nojsja["SlideView"] = (function () {

        // 初始化状态
        var isInit = false;

        // 轮播初始化
        var slideInit = function (imageArray) {

            if(isInit){
                return;
            }
            // 页面滚动信息
            var slideInfo  = {
                imageArray: [],
                //当前显示的图片位于imageArray的编号
                nowIndex: 0,
                // 下一张需要显示的图片位于imageArray的编号
                nextIndex: 0,
                // 滚动方向
                direction: 'left',
                // 需要滚动的宽度
                imageWidth: 0,
                imageHeight: 0,
                // 滚动的状态：是否正在滚动
                status: false
            }
            //所有待滑动的图片对象
            // 图片部件的宽度，用于滚动轮播
            slideInfo.imageWidth = document.getElementById('slideWrapper').offsetWidth;
            slideInfo.imageHeight = document.getElementById('slideWrapper').offsetHeight;
            slideInfo.imageArray = imageArray;

            // 创建DOM
            var slideItemList = document.getElementById('slideItemList');
            var slideText = document.getElementById('slideText');
            var pointList = document.getElementById('pointList');
            for(var i = 0; i < slideInfo.imageArray.length;  i++){
                (function (i) {
                    // 创建图片DOM
                    var slideItem  = document.createElement('div');
                    slideItem.setAttribute('class', 'slide-item');
                    slideItem.setAttribute('id', 'slide' + i);

                    var slideImage = document.createElement('img');
                    slideImage.setAttribute('src', slideInfo.imageArray[i].imageUrl);
                    slideItem.onmouseover = function () {
                        slideText.innerText  = slideInfo.imageArray[i].text;
                        slideText.style.display = 'block';
                    }
                    slideItem.onmouseout = function () {
                        slideText.style.display = 'none';
                    };
                    // 添加图片DOM
                    slideItem.appendChild(slideImage);
                    slideItemList.appendChild(slideItem);
                    // 创建滚动小白点DOM
                    var point = document.createElement('div');
                    point.setAttribute('id', 'point' + i);
                    point.setAttribute('class', 'slide-point');
                    if(i == 0){
                        point.style['background-color'] = '#4e6672';
                    }

                    // 添加小白点DOM
                    pointList.appendChild(point);
                })(i);
            }
            // 绑定滚动触发事件
            var triggerLeft = document.getElementById('triggerLeft');
            var triggerRight = document.getElementById('triggerRight');
            triggerLeft.onclick = function () {
                slideAction('left');
            };
            triggerRight.onclick = function () {
                slideAction('right');
            };
            // 6s自动轮播
            // 循环滚动方法
            function slideRoll() {
                // 正在轮播
                if(slideInfo.status){
                    return;
                }
                triggerRight.click();
            }
            var timer = setInterval(slideRoll, 10000);
            slideItemList.onmouseover = function () {
                clearInterval(timer);
            };
            slideItemList.onmouseout = function () {
                timer = setInterval(slideRoll, 10000);
            };
            // 窗口大小变化时触发的函数
            window.onresize = function () {
                slideInfo.imageWidth = document.getElementById('slideWrapper').offsetWidth;
                slideInfo.imageHeight = document.getElementById('slideWrapper').offsetHeight;
            }

            // 循环调用的滚动事件
            function slideAction(direction) {

                // 动画触发的时候不能点击
                if(slideInfo.status){
                    return
                }
                // direction滚动方向
                if(direction == 'left'){
                    slideInfo.nextIndex =
                        slideInfo.nowIndex == slideInfo.imageArray.length - 1 ? 0 : slideInfo.nowIndex + 1;
                }else {
                    slideInfo.nextIndex =
                        slideInfo.nowIndex == 0 ? slideInfo.imageArray.length - 1 : slideInfo.nowIndex - 1;
                }

                // 除了nowIndex和nextIndex之外的所有元素隐藏
                for(var i = 0; i < slideInfo.imageArray.length; i++){

                    (function (i) {
                        slideInfo.imageArray[i].offsetHeight = i * slideInfo.imageHeight;
                    })(i);
                }

                // 当前滚动部件
                var nowSlide = document.getElementById('slide' + slideInfo.nowIndex);
                var nextSlide = document.getElementById('slide' + slideInfo.nextIndex);
                // 在一定时间内移动X坐标
                var width = slideInfo.imageWidth;

                function slide() {
                    slideInfo.status = true;
                    // X坐标
                    var X_left = Number(nowSlide.style.left.substr(0, nowSlide.style.left.length - 2));
                    if(direction == 'left'){
                        --X_left;
                        nowSlide.style.left = X_left + 'px';
                        nextSlide.style.left = X_left + slideInfo.imageWidth + 'px';
                        nextSlide.style.top = -slideInfo.imageArray[slideInfo.nextIndex].offsetHeight + 'px';
                    }else{
                        ++X_left;
                        nowSlide.style.left = X_left + 'px';
                        nextSlide.style.left = X_left - slideInfo.imageWidth + 'px';
                        nextSlide.style.top = -slideInfo.imageArray[slideInfo.nextIndex].offsetHeight + 'px';
                    }
                    if(--width == 0){
                        document.getElementById('point' + slideInfo.nowIndex).style['background-color'] = '#FFFFFF'
                        // 滚动完成
                        slideInfo.nowIndex = slideInfo.nextIndex;
                        document.getElementById('point' + slideInfo.nowIndex).style['background-color'] = '#4e6672'
                        slideInfo.status = false;
                        return;
                    }else {
                        setTimeout(slide, 5);
                    }
                }
                setTimeout(slide, 5);
            }
        };

        return {
            init: slideInit
        };
    })();

    /* 小工具函数 */
    nojsja["Tool"] = (function () {

        // 获取当前日期 //
        function GetDate() {

            var dateArray = [];
            var date = new Date();
            var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
            var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

            dateArray.push(date.getFullYear(), "-", getMonth, "-", getDate,
                " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

            return (dateArray.join(""));
        }

        // 防止高频调用函数 //
        function FnDelay() {
            //采用单例模式进行内部封装
            // 存储所有需要调用的函数
            var fnObject = {};

            // 三个参数分别是被调用函数，设置的延迟时间，是否需要立即调用
            return function(fn, delayTime, IsImediate){

                // 立即调用
                if(!delayTime || IsImediate){
                    return fn();
                }
                // 判断函数是否已经在调用中
                if(fnObject[fn]){
                    return;
                }else {
                    // 定时器
                    var timer = setTimeout(function(){
                        fn();
                        //清除定时器
                        clearTimeout(timer);
                        delete(fnObject[fn]);
                    }, delayTime);

                    fnObject[fn] = {
                        "status": 'waitToRun',
                        "delayTime": delayTime,
                        "timer": timer
                    };
                }
            };
        }

        // Boolean类型转换函数 //
        function StringToBoolean (string) {

            if(string == "true" && typeof (string) == 'string'){
                return (string = true);
            }
            if(string === true && typeof (string) == 'boolean'){
                return (string = true);
            }
            return (string = false);
        };

        // 获取指定范围内的随机数 //
        function GetRandomNum(Min,Max) {
            // 1.Math.random(); 结果为0-1间的一个随机数(包括0,不包括1) 
            // 2.Math.floor(num); 参数num为一个数值，函数结果为num的整数部分。 
            // 3.Math.round(num); 参数num为一个数值，函数结果为num四舍五入后的整数。
            var Range = Max - Min;
            var Rand = Math.random();
            return(Min + Math.round(Rand * Range));
        }

        // 返回调用接口
        return {
            GetDate: GetDate,
            FnDelay: FnDelay,
            StringToBoolean: StringToBoolean,
            GetRandomNum: GetRandomNum
        };
    })();

    /* 获取当前日期 */
    nojsja["GetDate"] = function getDate() {

        var dateArray = [];
        var date = new Date();
        var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
        var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

        dateArray.push(date.getFullYear(), "-", getMonth, "-", getDate,
            " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

        return (dateArray.join(""));
    };

    /* 防止高频调用函数 */
    nojsja["FnDelay"] = (function FnDelay(){

        //采用单例模式进行内部封装
        // 存储所有需要调用的函数
        var fnObject = {};

        // 三个参数分别是被调用函数，设置的延迟时间，是否需要立即调用
        return function(fn, delayTime, IsImediate){

            // 立即调用
            if(!delayTime || IsImediate){
                return fn();
            }
            // 判断函数是否已经在调用中
            if(fnObject[fn]){
                return;
            }else {
                // 定时器
                var timer = setTimeout(function(){
                    fn();
                    //清除定时器
                    clearTimeout(timer);
                    delete(fnObject[fn]);
                }, delayTime);

                fnObject[fn] = {
                    "status": 'waitToRun',
                    "delayTime": delayTime,
                    "timer": timer
                };
            }
        };
    })();

    /* 页面悬浮按钮(后退和返回) */
    nojsja["HoverButton"] = (function () {

        // 模块是否初始化标志
        var isInit = false;
        // 是否点击
        var isClick = false;

        var hoverInit = function () {
            var hoverArea = document.getElementById('hoverArea');
            var goTop = document.getElementById('goTop');
            var returnHistory = document.getElementById('returnHistory');

            // 返回
            if(!hoverArea || !goTop || !returnHistory){
                return;
            }

            // 鼠标放上去
            hoverArea.onclick = function () {
                isClick = !isClick;
                if(isClick){
                    goTop.setAttribute('class',"hover-go-top hover-go-top-show");
                    returnHistory.setAttribute('class',"hover-return-history hover-return-history-show");
                }else {
                    goTop.setAttribute('class', "hover-go-top hover-go-top-hidden");
                    returnHistory.setAttribute('class', "hover-return-history hover-return-history-hidden");
                }
            };

            goTop.onclick = function () {
                scrollTo(0, 0);
            };
            returnHistory.onclick = function (){
                window.history.go(-1);
            };
        };

        /* 返回模块初始化调用接口 */
        return {
            init: hoverInit
        };
    })();

    /* 禁用浏览器滚动的方法 */
    nojsja["ScrollHandler"] = (function () {

        // 上下左右的键值码keycode
        var keys = {37: 1, 38: 1, 39: 1, 40: 1};
        // 阻止事件冒泡
        function preventDefault(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            e.returnValue = false;
        }

        function preventDefaultForScrollKeys(e) {
            if (keys[e.keyCode]) {
                preventDefault(e);
                return false;
            }
        }

        var oldonwheel, oldonmousewheel1, oldonmousewheel2, oldontouchmove, oldonkeydown
            , isDisabled;

        function disableScroll(object) {

            /* 新旧浏览器适配 */
            if (window.addEventListener) {
                if(object && (typeof object == "object")){
                    object.addEventListener('DOMMouseScroll', preventDefault, false);
                }else {
                    window.addEventListener('DOMMouseScroll', preventDefault, false);
                }
            }// older FF

            // 保存事件
            oldonwheel = window.onwheel;
            oldonmousewheel1 = window.onmousewheel;
            oldonmousewheel2 = document.onmousewheel;
            oldontouchmove = window.ontouchmove;
            oldonkeydown = document.onkeydown;

            if(object && (typeof object == "object")){
                object.onwheel = preventDefault; // modern standard
                object.onmousewheel = preventDefault; // older browsers, IE
                object.onmousewheel = preventDefault; // older browsers, IE
                object.ontouchmove = preventDefault; // mobile
                document.onkeydown = preventDefaultForScrollKeys;
            }else {
                window.onwheel = preventDefault; // modern standard
                window.onmousewheel = preventDefault; // older browsers, IE
                document.onmousewheel = preventDefault; // older browsers, IE
                window.ontouchmove = preventDefault; // mobile
                document.onkeydown = preventDefaultForScrollKeys;
            }
            isDisabled = true;
        }

        function enableScroll(object) {

            if (!isDisabled) return;

            if (window.removeEventListener){
                if(object && (typeof object == "object")){
                    object.removeEventListener('DOMMouseScroll', preventDefault, false);
                }else {
                    window.removeEventListener('DOMMouseScroll', preventDefault, false);
                }
            }

            if(object && (typeof object == "object")){
                object.onwheel = oldonwheel; // modern standard
                object.onmousewheel = oldonmousewheel1; // older browsers, IE
                object.onmousewheel = oldonmousewheel2; // older browsers, IE
                object.ontouchmove = oldontouchmove; // mobile
                document.onkeydown = oldonkeydown;
            }else {
                window.onwheel = oldonwheel; // modern standard
                window.onmousewheel = oldonmousewheel1; // older browsers, IE
                document.onmousewheel = oldonmousewheel2; // older browsers, IE
                window.ontouchmove = oldontouchmove; // mobile
                document.onkeydown = oldonkeydown;
            }

            isDisabled = false;
        }

        return {
            disableScroll: disableScroll,
            enableScroll: enableScroll
        };
    })();

})();
