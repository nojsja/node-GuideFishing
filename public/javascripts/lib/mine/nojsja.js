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
                objXMLHttp.open(method, url, true);
                if(method == ("POST")){
                    objXMLHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                    objXMLHttp.send(data);
                    /*//设置超时2.5分钟
                     setTimeout(function(){
                     if(objXMLHttp.readyState != 4 && objXMLHttp.readyState != 0){
                     alert("ajax响应超时");
                     objXMLHttp.abort();
                     }
                     }, "121000");*/
                }
                if(method == ("GET")){
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
    nojsja["ObserverPattern"] = (function () {

        // 观察者初始化
        function observerInit(object) {
            // 定义分数模式的观察者回调函数
            object.watcherList = {
                _list: []
            };
            // 为分数模式注册新的观察者
            object.listen = function (fn, type) {

                if(type){

                    if(!object.watcherList[type]){
                        object.watcherList[type] = [fn];
                    }else {
                        object.watcherList[type].push(fn);
                    }
                }else {
                    object.watcherList._list.push(fn);
                }

            };
            // 被观察者事件触发
            object.trigger = function (type) {

                if(type){

                    if(object.watcherList[type]){
                        for(var i = 0; i < object.watcherList[type].length; i++){
                            object.watcherList[type][i].apply(object);
                        }
                    }else {
                        return false;
                    }

                }else {

                    for(var i = 0; i < object.watcherList._list.length; i++){
                        object.watcherList._list[i].apply(object);
                    }
                }
            };

            // 解绑观察者事件监听
            object.remove = function (fn, type) {

                if(type){

                    var length = object.watcherList[type].length;
                    for(var i = length - 1; i >= 0; i-- ){
                        if(fn === object.watcherList[type][i]){
                            object.watcherList[type].splice(i, 1);
                        }
                    }
                }else {

                    var length = object.watcherList._list.length;
                    for(var i = length - 1; i >= 0; i-- ){
                        if(fn === object.watcherList._list[i]){
                            object.watcherList._list.splice(i, 1);
                        }
                    }
                }

            };
        }

        return {
            init: observerInit
        }
    })();

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
        // 激活标致
        var isActive = false;
        var modal, modalContent, acceptButton, contentP,
            selfDefineDiv, closeButton, showTimer, hiddenTimer;

        // 组件初始化事件
        function modalInit() {
            isInit = true;
            // 整个弹窗组件
            modal = document.getElementById('ModalWindow');
            // 显示的主要内容
            modalContent = document.getElementById('ModalContent');
            acceptButton = document.getElementById('modalAccept');
            closeButton = document.getElementById('modalClose');
            // 显示的文字信息
            contentP = document.getElementById('contentText');
            // 自定义组件的父级div
            selfDefineDiv = document.getElementById('selfDefineDiv');

            // 绑定点击关闭事件
            acceptButton.onclick = function () {
                modalHidden();
            };
            closeButton.onclick = function () {
              modalHidden();
            };
        }

        // 模态窗口弹出
        function modalShow(text, condition) {

            if(isActive){
                modalHidden();
                return setTimeout(function () {
                    modalShow(text, condition);
                }, 1000);
            }


            // 激活
            isActive = true;
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
                    clearInterval(showTimer);
                }else {
                    opacityValue += 5.0;
                    var topValue = Number(modalContent.style.top.substr(0, modalContent.style.top.length - 2));
                    // 动画函数一共会调用20次
                    modalContent.style.top = topValue - ( 20 / (100 / 5))  + 'px';
                    modalContent.style.opacity = opacityValue / 100;

                }
            }
            showTimer = setInterval(popAnimation, 10);
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

            // 激活标志
            isActive = false;
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
                    clearInterval(hiddenTimer);
                }else {
                    opacityValue -= 5.0;
                    var topValue = Number(modalContent.style.top.substr(0, modalContent.style.top.length - 2));
                    // 动画函数一共会调用20次
                    modalContent.style.top = topValue + ( 20 / (100 / 5))  + 'px';
                    modalContent.style.opacity = opacityValue / 100;

                }
            }
            hiddenTimer = setInterval(pushAnimation, 10);
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
        var slideTimer, autoTimer;

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
                touch: {
                    pageStartX: 0,
                    pageStartY: 0,
                    pageEndX: 0,
                    pageEndY: 0
                },
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

            // 移动端滑动事件绑定 -- 判断手指是左边滑动还是右边滑动
            nojsja['EventUtil'].addHandler(slideItemList, 'touchstart', function (event) {

                nojsja["FnDelay"](function (_event) {

                    var event = _event || window.event;
                    // 阻止浏览器默认的事件
                    event.preventDefault();

                    slideInfo.touch.pageStartX = event.changedTouches[0].pageX;
                    slideInfo.touch.pageStartY = event.changedTouches[0].pageY;

                }, 100, false, event);
            });
            nojsja['EventUtil'].addHandler(slideItemList, 'touchmove', function (event) {

                nojsja["FnDelay"](function (_event) {

                    var event = _event || window.event;
                    // 阻止浏览器默认的事件
                    event.preventDefault();

                    slideInfo.touch.pageEndX = event.changedTouches[0].pageX;
                    slideInfo.touch.pageEndY = event.changedTouches[0].pageY;

                    // 向右滑动
                    if(
                        Math.abs(slideInfo.touch.pageEndX - slideInfo.touch.pageStartX) >
                        Math.abs(slideInfo.touch.pageEndY - slideInfo.touch.pageEndY) &&
                        (slideInfo.touch.pageEndX - slideInfo.touch.pageStartX > 0)
                    ){
                        slideAction('right');
                    }

                    // 向左滑动
                    if(
                        Math.abs(slideInfo.touch.pageEndX - slideInfo.touch.pageStartX) >
                        Math.abs(slideInfo.touch.pageEndY - slideInfo.touch.pageEndY) &&
                        (slideInfo.touch.pageEndX - slideInfo.touch.pageStartX < 0)
                    ){
                        slideAction('left');
                    }

                }, 200, false, event);

            });

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
            autoTimer = setInterval(slideRoll, 10000);
            slideItemList.onmouseover = function () {
                clearInterval(autoTimer);
            };
            slideItemList.onmouseout = function () {
                autoTimer = setInterval(slideRoll, 10000);
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
                    // var X_left = parseInt(nowSlide.style.left);
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

                        clearInterval(slideTimer);
                    }
                }
                slideTimer = setInterval(slide, 5);
            }
        };

        return {
            init: slideInit
        };
    })();

    /* 图片轮播组件css3版本 */
    nojsja["SlideViewCss3"] = (function () {

        // 初始化状态
        var isInit = false;
        var slideTimer, autoTimer;

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
                touch: {
                    pageStartX: 0,
                    pageStartY: 0,
                    pageEndX: 0,
                    pageEndY: 0
                },
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

            // 移动端滑动事件绑定 -- 判断手指是左边滑动还是右边滑动
            nojsja['EventUtil'].addHandler(slideItemList, 'touchstart', function (event) {

                nojsja["FnDelay"](function (_event) {

                    var event = _event || window.event;
                    // 阻止浏览器默认的事件
                    event.preventDefault();

                    slideInfo.touch.pageStartX = event.changedTouches[0].pageX;
                    slideInfo.touch.pageStartY = event.changedTouches[0].pageY;

                }, 100, false, event);
            });
            nojsja['EventUtil'].addHandler(slideItemList, 'touchmove', function (event) {

                nojsja["FnDelay"](function (_event) {

                    var event = _event || window.event;
                    // 阻止浏览器默认的事件
                    event.preventDefault();

                    slideInfo.touch.pageEndX = event.changedTouches[0].pageX;
                    slideInfo.touch.pageEndY = event.changedTouches[0].pageY;

                    // 向右滑动
                    if(
                        Math.abs(slideInfo.touch.pageEndX - slideInfo.touch.pageStartX) >
                        Math.abs(slideInfo.touch.pageEndY - slideInfo.touch.pageEndY) &&
                        (slideInfo.touch.pageEndX - slideInfo.touch.pageStartX > 0)
                    ){
                        slideAction('right');
                    }

                    // 向左滑动
                    if(
                        Math.abs(slideInfo.touch.pageEndX - slideInfo.touch.pageStartX) >
                        Math.abs(slideInfo.touch.pageEndY - slideInfo.touch.pageEndY) &&
                        (slideInfo.touch.pageEndX - slideInfo.touch.pageStartX < 0)
                    ){
                        slideAction('left');
                    }

                }, 200, false, event);

            });

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
            autoTimer = setInterval(slideRoll, 10000);
            slideItemList.onmouseover = function () {
                clearInterval(autoTimer);
            };
            slideItemList.onmouseout = function () {
                autoTimer = setInterval(slideRoll, 10000);
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
                // 后面的图片在第一张图片后一字排开
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

                var X_left;

                function slide() {
                    slideInfo.status = true;
                    // X坐标
                    X_left = Number(nowSlide.style.left.substr(0, nowSlide.style.left.length - 2));

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

                        clearInterval(slideTimer);
                    }
                }
                slideTimer = setInterval(slide, 5);

            }
        };

        return {
            init: slideInit
        };
    })();

    /* 小工具函数 */
    nojsja["Tool"] = (function () {

        // 获取完整的当前日期 //
        function GetFullDate() {

            var dateArray = [];
            var date = new Date();
            var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
            var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

            dateArray.push(date.getFullYear(), "-", GetDate());

            return (dateArray.join(""));
        }

        /* 获取当前日期 */
        function GetDate() {

            var dateArray = [];
            var date = new Date();
            var getMonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1)) : ("" + (date.getMonth() + 1));
            var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

            dateArray.push(getMonth, "-", getDate,
                " ", GetTime());

            return (dateArray.join(""));
        }

        /* 获取当前时间 */
        function GetTime() {

            var dateArray = [];
            var date = new Date();
            var getHour = (date.getHours() < 10) ? ("0" + (date.getHours())) : ("" + (date.getHours()));
            var getMinite = (date.getMinutes() < 10) ? ("0" + (date.getMinutes())) : ("" + (date.getMinutes()));
            var getSecond = (date.getSeconds() < 10) ? ("0" + (date.getSeconds())) : ("" + (date.getSeconds()));

            dateArray.push(getHour, ":", getMinite, ":", getSecond);

            return (dateArray.join(""));
        }

        // 防止高频调用函数 //
        function FnDelay() {
            //采用单例模式进行内部封装
            // 存储所有需要调用的函数
            var fnObject = {};

            // 三个参数分别是被调用函数，设置的延迟时间，是否需要立即调用
            return function(fn, delayTime, IsImediate, arges){

                // 立即调用
                if(!delayTime || IsImediate){
                    return fn(arges);
                }
                // 判断函数是否已经在调用中
                if(fnObject[fn]){
                    return;
                }else {
                    // 定时器
                    var timer = setTimeout(function(){
                        fn(arges);
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

        // html字符编码和解码
        function HTMLEncode(str) {

            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&gt;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br>");
            return s;
        }

        function HTMLDecode(str) {

            var s = "";
            if (str.length === 0) return "";
            s = str.replace(/&gt;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "\'");
            s = s.replace(/&quot;/g, "\"");
            s = s.replace(/<br>/g, "\n");
            return s;
        }
        
        // 常用符号解码
        function SymbolDecode(str) {
            var s = "";
            if(str.length === 0) return s;

            s = str.replace(/&#34;/g, "\"");

            return s;
        }

        // 识别浏览器
        function GetBrowserType(){

            var userAgent = navigator.userAgent;
            mconsole.log(userAgent);
            // 取得浏览器的userAgent字符串
            var isOpera = userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1;
            // 判断是否Opera浏览器
            if (isOpera) {
                return "Opera"
            };
            // 判断是否Firefox浏览器
            if (userAgent.indexOf("Firefox") > -1) {
                return "FireFox";
            }
            // 识别谷歌浏览器
            if (userAgent.indexOf("Chrome") > -1){
                return "Chrome";
            }
            // 判断是否Safari浏览器
            if (userAgent.indexOf("Safari") > -1) {
                return "Safari";
            }
            // 判断是否IE浏览器
            if (
                (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) ||
                (!!window.ActiveXObject || "ActiveXObject" in window)
            ) {
                return "IE";
            };
            // 新版IE浏览器Edge
            if (userAgent.indexOf("Edge") > -1) {
                return "Edge";
            }

            return "Unknown";
        }

        // 返回调用接口
        return {
            GetDate: GetDate,
            GetFullDate: GetFullDate,
            GetTime: GetTime,
            FnDelay: FnDelay,
            HTMLEncode: HTMLEncode,
            HTMLDecode: HTMLDecode,
            SymbolDecode: SymbolDecode,
            StringToBoolean: StringToBoolean,
            GetRandomNum: GetRandomNum,
            GetBrowserType: GetBrowserType
        };
    })();

    nojsja['GetDocumentHeight'] = {

        "FireFox": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.documentElement.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if (type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.documentElement.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        },

        "Opera": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.body.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if (type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
            };
            }
        },

        "Chrome": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.body.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if(type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        },

        "Edge": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.body.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if(type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        },

        "IE": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.documentElement.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if(type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.documentElement.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        },

        "Safari": function () {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.body.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if(type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        },

        "Unknown": function (target, type) {

            if(target && type) {

                if (type == 'clientHeight')
                    return target[type] = document.documentElement.clientHeight;

                if (type == 'scrollTop')
                    return target[type] = document.body.scrollTop;

                if (type == 'scrollHeight') {
                    return target[type] = document.documentElement.scrollHeight;
                }
                if(type == 'offsetHeight') {
                    return target[type] = document.body.offsetHeight;
                }
            }else {
                return {
                    clientHeight: document.documentElement.clientHeight,
                    scrollTop: document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight,
                    offsetHeight: document.body.offsetHeight
                };
            }
        }
    };

    /* js函数锁的简单实现 */
    nojsja["FnLocker"] = (function () {

        var lockerFnList = [];

        // 上锁
        function lock(fn) {

            if (lockerFnList.indexOf(fn) > -1){
                return false;
            }
            lockerFnList.push(fn);
            return true;
        }

        // 检查是否上锁
        function check(fn) {

            if(lockerFnList.indexOf(fn) >= 0){
                return true;
            }
            return false;
        }

        // 解除锁定
        function unlock(fn) {

            if(lockerFnList.indexOf(fn) == -1){
                return false;
            }
            lockerFnList.splice(lockerFnList.indexOf(fn), 1);
        }

        return {
            lock: lock,
            check: check,
            unlock: unlock
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
        return function(fn, delayTime, IsImediate, args){

            // 立即调用
            if(!delayTime || IsImediate){
                return fn(args);
            }
            // 判断函数是否已经在调用中
            if(fnObject[fn]){
                return;
            }else {
                // 定时器
                var timer = setTimeout(function(){
                    fn(args);
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

    /* 页面悬浮按钮(后退和返回) */
    nojsja["DanmuColor"] = (function () {

        // 模块是否初始化标志
        var isInit = false;
        // 是否点击
        var isClick = false;
        // 按钮组
        var danmuColorArray = [];
        // 返回的danmu对象
        var danmuObject = {};
        // 按钮组件
        var danmuWrapper, danmuColorHover, danmuSend, danmuCancel, danmuText;

        // 组件初始化
        function danmuColorInit() {

            if(isInit){
                return;
            }else {
                isInit = !isInit;
            }
            // 选择器
            danmuWrapper = document.getElementById('danmuWrapper')
            danmuColorHover = document.getElementById('danmuColorHover');
            danmuSend = document.getElementById('danmuSend');
            danmuCancel = document.getElementById('danmuCancel');
            danmuText = document.getElementById('danmuText');

            // 获取颜色选择对象
            for(var i = 0; i < 6; i++) {

                (function (i) {
                    var danmuColorObject = document.getElementById('danmuColor' + (i + 1));
                    danmuColorObject.onclick = function () {
                        danmuObject['color'] = danmuColorObject.getAttribute('color');
                         danmuColorArray.forEach(function (obj) {
                            obj.style.borderColor = 'white';
                         });
                         this.style.borderColor = 'red';
                    };
                    danmuColorArray.push(danmuColorObject);

                })(i);
            }

            danmuColorHover.onclick = danmuColorHoverClick;

                // 取消发送
            danmuCancel.onclick = danmuWrapperHidden;
        };

        // 点击选择颜色
        function danmuColorHoverClick() {

            isClick = !isClick;
            if(isClick){

                for(var i = 0; i < danmuColorArray.length; i++){

                    (function (i) {
                        danmuColorArray[i].setAttribute('class', ['danmu-color ' + 'color' + (i + 1), ' danmu-color-show-' + (i + 1)].join(''));
                    })(i);
                }
            }else {

                for(var i = 0; i < danmuColorArray.length; i++){
                    (function (i) {
                        danmuColorArray[i].setAttribute('class', ['danmu-color ' + 'color' + (i + 1), ' danmu-color-hidden'].join(''));
                    })(i);
                }
            }
        }

        // 组件隐藏
        function danmuWrapperHidden() {
            danmuObject = {};
            danmuColorHoverClick();
            danmuWrapper.style.display = 'none';
            danmuWrapper.setAttribute('class', 'danmu-wrapper');
        }

        // 组件显示
        function danmuWrapperShow(callback) {

            if(!isInit){
                danmuColorInit();
            }

            danmuWrapper.style.display = 'block';
            danmuWrapper.setAttribute('class', 'danmu-wrapper danmu-wrapper-show');
            // 触发颜色选择
            danmuColorHoverClick();

            //发送弹幕
            danmuSend.onclick = function () {
                var text = danmuText.value.trim();
                if(text == '' || text == null || text == undefined){
                    return alert('弹幕不能为空！');
                }
                danmuObject['text'] = text;

                callback(danmuObject);
            };

        }

        /* 返回模块初始化调用接口 */
        return {
            init: danmuColorInit,
            hidden: danmuWrapperHidden,
            show: danmuWrapperShow
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

    /* 轻量化弹幕池 */
    nojsja["DanmuPool"] = (function () {

        // 内部弹幕池
        var _pool = [];
        var attrArray = ['color', 'text', 'date', 'user'];

        // 弹幕构造函数
        function danmu() {

            // 定时器
            this.timer = {};
            // 宽度
            this.width = 0;
            var that = this;
            // 初始化DOM
            this.dom = (function (that) {

                var $danmuDiv = $('<div class="danmu-div">');
                var $p = $('<p>');

                $danmuDiv.append($p);
                // 获取位置
                function getPosition() {
                    // 返回距离左上角的绝对坐标
                    return {
                        x: $danmuDiv[0].offsetLeft,
                        y: $danmuDiv[0].offsetTop
                    }
                };
                function setPosition(x, y) {
                    $danmuDiv[0].style.left = x + 'px';
                    $danmuDiv[0].style.top = y + 'px';
                }
                function setPositionX(x) {
                    $danmuDiv[0].style.left = x + 'px';
                }
                // 移动
                function move(_info) {

                    var bodyHeight = danmu.getHeight();
                    var bodyWidth = danmu.getWidth();

                    var positionX = danmu.getWidth();
                    var positionY = nojsja["Tool"].GetRandomNum(parseInt(bodyHeight * 0.15), parseInt(bodyHeight * 0.85));
                    $danmuDiv.prop('class', 'danmu-div danmu-show');
                    if(_info.border){
                        $danmuDiv.css('border', 'solid 1px ' + _info.border);
                    }else {
                        $danmuDiv.css('border', 'solid 0px white');
                    }
                    if(_info.color){
                        $p.css('color', _info.color);
                    }
                    $p.text(_info.text);

                    document.body.appendChild($danmuDiv[0]);

                    setPosition(positionX, positionY);

                    // 循环移动
                    function _move() {

                        setPositionX(--bodyWidth);
                        // 触碰边界后检测
                        if(bodyWidth + that.width == 0){

                            if(that.width !== 0){
                                free();
                                return clearInterval(that.timer);
                            }

                            that.width = $danmuDiv[0].offsetWidth;

                        }
                    }
                    that.timer = setInterval(_move, 15);

                };
                // 释放
                function free() {

                    $danmuDiv.prop('class', 'danmu-div danmu-hidden');
                    document.body.removeChild($danmuDiv[0]);
                    that.width = 0;
                    _pool.push(that);
                }

                // 返回调用接口
                return {
                    move: move
                }
            })(that);
        }

        // 获取屏幕高度
        danmu.getWidth = function () {
            // 包括变现的宽度
            return document.body.clientWidth;
        };
        // 获取屏幕宽度
        danmu.getHeight = function () {
            return document.body.clientHeight;
        };

        // 对象继承
        // 获取弹幕的位置
        danmu.prototype.getPosition = function () {
            this.dom.getPosition();
        };
        // 弹幕的移动
        danmu.prototype.move = function (info) {
            this.dom.move(info);
        };
        // 弹幕的释放
        danmu.prototype.free = function () {
            this.dom.free();
        };

        // 获取一个弹幕对象
        function getOne() {
            if(_pool.length == 0){
                var danmuObject = new danmu();
                return danmuObject;

            }else {
                return _pool.pop();
            }
        }

        // 返回调用接口
        return {
            // 获取一个弹幕对象
            get: getOne
        };

    })();

    /* 兼容各个浏览器的事件处理程序 */
    nojsja["EventUtil"] = {

        addHandler: function (element, type, handler, arges) {
            if(element.addEventListener){
                element.addEventListener(type, handler, false);

            }else if(element.attachEvent){
                element.attachEvent('on' + type, handler);

            }else {
                element['on' + type] = handler;
            }
        },

        removeHandler: function (element, type, handler, arges) {
            if(element.removeEventListener){
                element.removeEventListener(type, handler, false);

            }else if(element.detachEvent){
                element.detachEvent('on' + type, handler);

            }else {
                element['on' + type] = null;
            }
        },
    };

    /* 发送移动端浏览器调试信息到后台 */
    window['mconsole'] = nojsja['mconsole'] = {
        log: function (data){

            nojsja["AjaxPool"].sendRequest('POST', '/mconsole', JSON.stringify({
                data: data
            }), function (xmlHttpObject) {

                if(xmlHttpObject.responseText){
                    console.log(xmlHttpObject.responseText);
                }
                xmlHttpObject.readyState = 0;
            });
        }
    };


})();
