/**
 * Created by yangw on 2016/11/16.
 * 课程直播间
 */

/* 页面准备好后触发 */
$(function () {

    // 初始化socket连接
    BroadcastAction.socketInit();
    // 初始化页面事件
    BroadcastAction.pageEventBind();
    // 绑定消息观察者事件
    BroadcastAction.watcherInit(BroadcastAction.message.send);
    BroadcastAction.watcherInit(BroadcastAction.message.received);
    // 注入激活观察者函数
    BroadcastAction.watcherActive();
});

/**
 * 页面变量
 * courseName -- 直播间的名字(课程名字)
 * message -- 页面消息对象,
 * 包含收到的消息(received)和即将发送(send)的消息.
 * value -- 接收/发送的消息对象, watcherList -- 存储所有观察者
 * listen -- 注入新的观察者, trigger -- 触发所有观察者
 * socket -- 页面初始化时连接到服务器的socket对象
 * file -- origin 未转换前的文件, data -- 转换后即将上传的文件, type -- 文件类型
 * upload -- 文件上传相关
 * isAdmin -- 是否具有管理员权限
 * reader -- 文件读取对象fileReader
 * record -- 录音对象,
 * status -- 录音状态
 * */

var BroadcastAction = {

    socket: {},
    courseName: "",
    isAdmin: false,

    message: {
        send: {
            value: {},
            watcherList: [],
            listen: function () {},
            trigger: function () {}
        },
        received: {
            value: {},
            watcherList: [],
            listen: function () {},
            trigger: function () {}
        }
    },

    file: {
        reader: {},
        origin: "",
        type: "",
        upload: {
            setProgress: function (value) {},
            hidden: function () {},
            show: function () {}
        }
    },

    record: {
        status: ""
    }
};

/* 初始化socket连接 */
BroadcastAction.socketInit = function () {

    // 弹出窗口
    var userName  = "Johnson" || prompt('请输入昵称');
    $('#name').text(userName);

    // 连接到服务器,绑定观察者对象
    BroadcastAction.socket = io();
    // 监听事件
    // 所有消息类型是可以自定义的
    BroadcastAction.socket.on('connect', function () {

        var name = $('#name').text() || '匿名';
        BroadcastAction.socket.emit('join', {
            name: name,
            isAdmin: BroadcastAction.isAdmin
        });
    });

    // 系统消息
    BroadcastAction.socket.on('systemMessage', function (data) {

        // 格式化接收到的数据
        var info = {
            message: data.msg || data.message,
            from: data.from,
            messageType: data.messageType,
            path: data.path || ""
        };

        BroadcastAction.message.received.value = info;
        BroadcastAction.message.received.trigger('systemMessage', info);
    });
    
    // 用户聊天消息
    BroadcastAction.socket.on('newMessage', function (data) {

        // 格式化接收的数据
        var info = {
            message: data.msg || "",
            from: data.from,
            isAdmin: data.isAdmin,
            messageType: data.messageType,
            url: data.url || ""
        };

        BroadcastAction.message.received.value = info;
        BroadcastAction.message.received.trigger('newMessage', info);
    });

    // 服务器请求上传更多数据
    BroadcastAction.socket.on('moreData', function (data) {

        // 触发上传
        BroadcastAction.message.received.trigger('moreData', {
            percent: data.percent,
            position: data.position
        });

    });

    // 服务器文件上传完成
    BroadcastAction.socket.on('uploadDone', function () {

        // 触发事件
        BroadcastAction.message.received.trigger('uploadDone');
    });

    // 直播状态检查
    BroadcastAction.socket.on('check', function (info) {

        BroadcastAction.message.received.trigger('check', info);
    });
    
    // 载入直播的历史数据
    BroadcastAction.socket.on('load', function (info) {

        BroadcastAction.message.received.trigger('load', info);
    });

    // 结束直播操作
    BroadcastAction.socket.on('finish', function (info) {

        BroadcastAction.message.received.trigger('finish', info);
    });

};

/* 页面事件绑定 */
BroadcastAction.pageEventBind = function () {

    // 当前课程名(也是直播间的名字)
    BroadcastAction.courseName = $('.broadcast-room').text().trim();

    // 检查当前课程的直播状态
    BroadcastAction.broadcastStatusCheck();

    // 绑定结束直播事件
    if(BroadcastAction.isAdmin){
        $('.finish-broadcast-div > span').click(BroadcastAction.finishBroadcast);
    }

    // 获取音频事件初始化
    BroadcastAction.getMediaDataInit();

    // 上传事件绑定
    BroadcastAction.file.upload = {

        setProgress: function (value) {
            // 更新页面进度条
            $('.progress-bar').css('width', value);
            return this;
        },
        hidden: function () {
            if($('.progress').css('display') == 'block'){
                $('.progress').fadeOut();
            }
            return this;
        },
        show: function () {
            if($('.progress').css('display')  != 'block'){
                $('.progress').fadeIn();
            }
            return this;
        }
    };

    // 用户发送消息
    $('#messageSend').click(function () {
        BroadcastAction.message.send.trigger('send');
    });

    // messageInput键盘事件绑定
    $('#messageInput').on('keydown', function (e) {

        // 事件代码Enter
        if(e.which == 13){
            BroadcastAction.message.send.trigger('send');
        }
    });

    // 文件选中上传事件
    $('#fileChoose').on('change', function () {

        console.log('on change');
        //判断浏览器是否支持FileReader接口
        if(typeof FileReader == 'undefined'){
            //使选择控件不可操作
            $('#fileChoose').setAttribute("disabled","disabled");
            return BroadcastAction.modalWindow('你的浏览器不支持读取本地文件!');
        }

        // 获取文件
        var file = document.getElementById('fileChoose').files[0];

        if(file){
            BroadcastAction.file.origin = file;
            console.log(file.size + " + " + file.name);
            BroadcastAction.file.reader = new FileReader();
            // 注意这儿载入的是文件分片后的数据
            // 这个需要服务器返回第一次返回后客户端确认信息
            BroadcastAction.file.reader.onload = function (event) {

                // 为2是读取成功
                console.log("readyState: " + this.readyState);

                var data = this.result || event.target.result;
                console.log('reader onload.');
                /* 通过内部的result对象取到读取后的数据 */
                BroadcastAction.socket.emit('upload', {
                    "Name": BroadcastAction.file.origin.name,
                    "Segment": data
                });
            };
            console.log('start');
            // 触发开始上传事件
            // 等待服务器发回允许上传的回调信息后开始载入文件流式传输到服务器
            BroadcastAction.socket.emit('start', {
               "Name": BroadcastAction.file.origin.name,
                "Size": BroadcastAction.file.origin.size,
                "CourseName": BroadcastAction.courseName
            });
        }
    });
    
    // 选择并上传文件到服务器, 服务器再广播到房间
    $('#fileSend').click(function () {

        $('#fileChoose').click();
    });
    
};

/* 结束课程直播 */
BroadcastAction.finishBroadcast = function () {

    if(confirm('确定结束当前直播?')){
        BroadcastAction.socket.emit('finish');
    }
};

/* 观察者模式声明 */
BroadcastAction.watcherInit = function (obj) {

    // 观察者触发函数数组
    obj.watcherList = {};
    // 添加观察者, 各个观察者对应相应的类型
    obj.listen = function (type, fn) {
        // 本观察类型不存在
        if(!this.watcherList[type]){
            this.watcherList[type] = [fn];
        }else {
            this.watcherList[type].push(fn);
        }

        return this;
    };
    // 触发观察者
    obj.trigger = function (type, args) {

        // 如果没有此观察类型,则返回
        if(!this.watcherList[type]){
            return;
        }
        // 包裹定义消息信息
        // 观察者触发事件类型
        var events = {
            type: type,
            args: args || {}
        };
        for(var index in this.watcherList[type]){
            // 绑定作用域,遍历触发函数
            this.watcherList[type][index].call(this, events);
        }
    };

    // 移除观察者
    obj.remove = function (type, fn) {

        // 判断是否是数组
        if(this.watcherList[type] instanceof Array){
           var i = this.watcherList[type].length - 1;
           for(i; i >= 0; i--){
               if(this.watcherList[type][i] === fn ){
                   // 数组删除指定索引的元素
                   this.watcherList[type].splice(i, 1);
               }
           }
        }
    };
};

/* 观察者模式注入 */
BroadcastAction.watcherActive = function () {

    //--- 发送消息 ---//

    // 发送消息
    BroadcastAction.message.send.listen('send', send);

    // 向服务器发送消息函数,事件类型定义为send
    function send() {
        // 发送检测
        var message = $('#messageInput').val().trim();
        // 更新数据依赖
        BroadcastAction.message.send.value = message;
        if(!message){
            return BroadcastAction.modalWindow('请输入要发送的消息!');
        }
        // 置空消息
        // $('#messageInput').val('');
        // 发送
        BroadcastAction.socket.send(message);
    }

    //--- 接收消息 ---//

    // 接收系统消息
    BroadcastAction.message.received.listen('systemMessage', receiveSystemMsg);
    // 接收用户消息
    BroadcastAction.message.received.listen('newMessage', receiveNewMsg);
    // 接收上传开始上传文件的信息
    BroadcastAction.message.received.listen('moreData', startUpload);
    // 文件上传完成
    BroadcastAction.message.received.listen('uploadDone', uploadDone);
    // 直播状态检查
    BroadcastAction.message.received.listen('check', broadcastCheck);
    // 更新直播的历史记录
    BroadcastAction.message.received.listen('load', updateHistoryPage);
    // 直播结束事件
    BroadcastAction.message.received.listen('finish', finish);

    //--- 接收消息 ---//


    // 上传完成
    function uploadDone() {

        // 更新页面进度条
        BroadcastAction.file.upload.setProgress('100%')
            .hidden();
        // 清除缓存
        BroadcastAction.file.reader = null;
        BroadcastAction.file.origin = null;
    }

    // 开始上传数据
    function startUpload(info) {

        console.log('uploading...');
        // 每次上传的长度1024kb, 1048576字节
        var length = 1048576;
        //上传的位置和进度
        // position相除减小过数字
        var position = info.args.position * length;
        var percent = info.args.percent;

        // 分割的文件对象
        var newFile = null;
        // 目前的操作对象
        var currentFile = BroadcastAction.file.origin;

        // 更新页面进度条
        BroadcastAction.file.upload.show();
        BroadcastAction.file.upload.setProgress(percent);

        // 裁切文件并兼容浏览器
        if(currentFile.slice){
            newFile = currentFile.slice(position, position +
                Math.min(length, currentFile.size - position));

        }else if(BroadcastAction.file.origin.webkitSlice){
            newFile = currentFile.webkitSlice(position, position +
                Math.min(length, currentFile.size - position));

        }else if(BroadcastAction.file.origin.mozSlice){
            newFile = currentFile.mozSlice(position, position +
                Math.min(length, currentFile.size - position));

        }
        // 触发文件上传二进制
        if(newFile){
            BroadcastAction.file.reader.readAsBinaryString(newFile);
        }


    }

    // 接收系统消息
    function receiveSystemMsg(info) {

        // 消息发送者和消息内容和消息类型
        var system = "SYSTEM";
        var msg = info.args.message;
        var messageType = info.messageType;

        var date = BroadcastAction.getDate();

        // 添加DOM
        var $messageList = $('.message-list');
        var $messageItem =
            $('<div class="message-list-item message-list-item-system">');

        var $PH = $('<p class="p-head p-head-system">').text(date + " " + system);
        var $PB = $('<p>').text(msg);
        $messageItem
            .append($PH)
            .append($PB);
        $messageList.append($messageItem);

        // 滚到页面底部
        var div = document.getElementById('messageList');
        div.scrollTop = div.scrollHeight;
    }

    // 接收用户新消息
    function receiveNewMsg(info) {

        // 执行DOM更新
        BroadcastAction.newMessageUpdate(info.args);
    }
    
    /** 直播状态检查
     * broadcastIng -- 正在直播
     * broadcastDone -- 直播完成等待发布
     * broadcastNone -- 无法查询到当前直播
     * */
    function broadcastCheck(info) {

        if(info.args.isError){

            return BroadcastAction.modalWindow('检查状态时发生错误!请刷新页面,错误码: ' + info.args.error);
        }

        // 判断返回的直播状态
        var broadcastStatus = info.args.status;
        // 正在直播
        if(broadcastStatus == "broadcastIng"){

            BroadcastAction.loadBroadcastHistory(broadcastStatus);
        }else if(broadcastStatus == "broadcastDone"){

            BroadcastAction.loadBroadcastHistory(broadcastStatus);
            // 断开连接,冻结发送区域
            finish();
        } else if(broadcastStatus == "broadcastNone"){

            BroadcastAction.modalWindow('未查询到相关的课程直播数据,请退出');
            // 断开连接, 冻结发送区域
            finish();
        }
    }

    /** 更新直播历史记录数据页面
     * 数据格式
     * messageType -- 数据类型(texts, audios, images, videos)
     * date -- 日期字符串
     * msg -- 文字信息或是媒体数据名
     * from -- 发送者
     * url -- 多媒体对象的访问路径
     * */
    function updateHistoryPage(info) {

        // 获取数据出错
        if(info.args.isError){
            return BroadcastAction.modalWindow('直播历史记录载入出错!请重试');
        }
        // 所有直播的数据
        var courseOriginArray = info.args.courseOrigin;
        // 遍历数据更新页面
        for (var index in courseOriginArray){

            BroadcastAction.newMessageUpdate(courseOriginArray[index]);
        }
    }

    // 结束直播事件
    function finish(info) {

        if(info.args.isError){

            return BroadcastAction.modalWindow('结束当前直播失败,请重试,错误代码: ' + info.args.error);
        }

        // 断开服务器端的连接
        BroadcastAction.socket.disconnect();
        // 禁用客户端的消息发送
        $('.send-wrapper').prop('class', 'send-wrapper send-wrapper-hidden');
    }

};

/* 发送检查当前直播状态的命令 */
BroadcastAction.broadcastStatusCheck = function () {

    BroadcastAction.socket.emit('broadcastCheck');
};

/* 发送载入直播的历史记录数据请求 */
BroadcastAction.loadBroadcastHistory = function (status) {

    BroadcastAction.socket.emit('loadHistory', {
        status: status
    });
};

/* 页面消息更新 */
BroadcastAction.newMessageUpdate = function (info) {

    // 消息参数
    var from = info.from,
        msg = info.message || info.msg,
        path = info.url,
        messageType = info.messageType,
        isAdmin = BroadcastAction.stringToBoolean(info.isAdmin);

    var date = info.date || BroadcastAction.getDate();

    // 选择方法
    var update = {

        // 更新页面文本 //
        texts: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item message-list-item-user">');

            var $pHead = $('<p class="p-head">');
            if(isAdmin){
                $pHead = $('<p class="p-head p-head-admin">');
            }
            var $PH = $($pHead)
                .text(date + " " + from);
            var $PB = $('<p>').text(msg);
            $messageItem
                .append($PH)
                .append($PB);

            $messageList.append($messageItem);
            // 滚到页面底部
            window.scrollTo(0,document.body.scrollHeight);
        },

        // 更新页面视频消息 //
        videos: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item message-list-item-user">');

            // 首部信息
            var $pHead = $('<p class="p-head">');
            if(isAdmin){
                $pHead = $('<p class="p-head p-head-admin">');
            }

            // 文本消息
            var $messageItemText =
                $pHead;
            $messageItemText.text(date + " " + from)
                .appendTo($messageItem);

            // 视频消息
            var $messageItemVideo =
                $('<video class="message-list-item-video">');
            $messageItemVideo
                .prop({
                    src: path,
                    controls: 'controls'
                })
                .appendTo($messageItem);

            // 添加到页面
            $messageList.append($messageItem);
            // 滚到页面底部
            window.scrollTo(0,document.body.scrollHeight);
        },

        // 更新页面音频消息 //
        audios: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item message-list-item-user">');

            // 首部信息
            var $pHead = $('<p class="p-head">');
            if(isAdmin){
                $pHead = $('<p class="p-head p-head-admin">');
            }

            // 文本消息
            var $messageItemText =
                $pHead;
            $messageItemText.text(date + " " + from)
                .appendTo($messageItem);

            // 音频消息, 默认是隐藏的, 是HTML5元素
            var $audio =
                $('<audio>');

            // 媒体获取完毕后
            $audio[0].addEventListener("loadedmetadata", function(){
                var total = parseInt(this.duration);//获取总时长
                $(this).attr('duration', total);
                updateDuration();
            });

            // 设置属性
            $audio
                .prop({
                    src: path,
                    controls: 'controls',
                    style: 'display: none',
                    preload: 'metadata'
                })
                .appendTo($messageItem);

            // 音频DOM自定义元素
            // 音频时长
            // 获取节点对象而不是jQuery对象
            var $audioDefine = $('<div class="audio-define">');
            // 音频标志
            var $audioSpan = $('<span class="glyphicon glyphicon-volume-up">');

            // 把播放时间添加到DOM上去
            function updateDuration() {
                // 播放时长
                var $duration = $('<div class="audio-duration">');
                $duration.text($audio.attr('duration') + '\'\'');
                $duration.appendTo($audioDefine);
            }

            // 绑定点击事件
            $audioDefine.click(function () {
                $(this).prop('class', 'audio-define audio-define-read');
                if($audio[0].paused){
                    $audio[0].play();
                }else {
                    $audio[0].pause();
                }
            });


            // 添加音频消息
            $audioDefine.append($audioSpan)
                .appendTo($messageItem);
            // 添加到页面
            $messageList.append($messageItem);
            // 滚到页面底部
            window.scrollTo(0,document.body.scrollHeight);
        },

        // 更新页面图片消息 //
        images: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item message-list-item-user">');

            // 首部信息
            var $pHead = $('<p class="p-head">');
            if(isAdmin){
                $pHead = $('<p class="p-head p-head-admin">');
            }

            // 文本消息
            var $messageItemText =
                $pHead;
            $messageItemText.text(date + " " + from)
                .appendTo($messageItem);

            // 图片消息
            var $messageItemVideo =
                $('<img class="message-list-item-image">');
            $messageItemVideo
                .prop( {src: path} )
                .appendTo($messageItem);

            // 添加到页面
            $messageList.append($messageItem);
            // 滚到页面底部
            window.scrollTo(0,document.body.scrollHeight);
        }
    };

    update[messageType]();

};

/* 获取浏览器媒体数据 */
BroadcastAction.getMediaDataInit = function (type) {

    // 初始化录音按钮
    var $recordButton = $('#recordButton');
    // 绑定事件
    $recordButton.click(function () {

        if(BroadcastAction.record.status === ""){
            // 当前未录音
            BroadcastAction.record.status = "none";
        }
        // 如果正在录音
        if(BroadcastAction.record.status == "none"){
            $(this).attr('class', 'glyphicon glyphicon-off recording');
            BroadcastAction.record.status = "recording";
            startRecord();
        }else {
            $(this).attr('class', 'glyphicon glyphicon-record');
            BroadcastAction.record.status = "none";
            stopRecord();
        }
    });

    /** 录音对象
     * index -- 目前录音文件的索引
     * blobData -- 获取到的二进制大对象
     * recorder -- 处理录音的对象
     * audioContext -- 管理和播放声音的对象
     * mediaConstraints -- 获取媒体的类型限制
     * fileReader -- 文件读取api
     * courseName -- 录音所属的课程
     **/
    var Record = {
        courseName: BroadcastAction.courseName,
        index: 1,
        blobData: "",
        recorder: {},
        audioContext: new AudioContext() || new webkitAudioContext(),
        mediaConstraints: { audio: true },
        fileReader: new FileReader()
    };

    // 获取媒体数据接口
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);

    // 开始录音
    function startRecord() {
        // 用户浏览器不支持
        if(!hasGetUserMedia()){
            return BroadcastAction.modalWindow('你的浏览器不支持获取多媒体数据!');
        }

        // 开始获取媒体数据
        navigator.getUserMedia(Record.mediaConstraints, startUserMedia, noStream);

        function startUserMedia(stream) {

            // 创建一个媒体声音源
            var input = Record.audioContext.createMediaStreamSource(stream);

            // 回送环,将该音源和硬件相连
            // input.connect(Record.audioContext.destination);

            Record.recorder = new Recorder(input);
            // 录制
            Record.recorder.record();
        }

        // 检测浏览器是否支持相关的htmlAPI, !!把undefined/NAN/null 转化成false
        function hasGetUserMedia() {
            return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
        }

        // 获取失败
        function noStream(err) {

            if(err.PERMISSION_DENIED) {
                BroadcastAction.modalWindow('用户拒绝了浏览器请求媒体的权限');
            } else if(err.NOT_SUPPORTED_ERROR) {
                BroadcastAction.modalWindow('constraint中指定的媒体类型不被支持');
            } else if(err.MANDATORY_UNSATISFIED_ERROR) {
                BroadcastAction.modalWindow('指定的媒体类型未接收到媒体流');
            }
            console.log( '调用麦克风权限发生错误: ' + err);
        }
    }
    
    // 停止录音并且上传base64编码的字符串
    function stopRecord() {

        Record.recorder.stop();
        // 导出成二进制数据文件
        Record.recorder.exportWAV(function(blob) {

            // 使用浏览器进行base64编码, 默认是audio/wav
            Record.fileReader.readAsDataURL(blob);
            // 读取成功
            Record.fileReader.onload = function (event) {

                console.log('base64 read success.');
                // 取得编号后的数据
                Record.base64Data = this.result || event.target.result;

                // 向服务器发送数据
                BroadcastAction.socket.emit('record', {

                    action: "upload",
                    base64Data: Record.base64Data,
                    index: Record.index,
                    courseName: Record.courseName
                });
                // 音频编号+1
                Record.index += 1;
                // 释放recorder
                Record.recorder.clear();
            };

            //读取失败
            Record.fileReader.onerror = function (e) {

                BroadcastAction.modalWindow('[audio read error]: ' + e);
                Record.recorder.clear();
            };

        });
    }

};

/* Boolean字符串转换函数 */
BroadcastAction.stringToBoolean = function (string) {

    if(string == "true" && typeof (string) == 'string'){
        return (string = true);
    }
    if(string === true && typeof (string) == 'boolean'){
        return (string = true);
    }
    return (string = false);
};

/* 得到现在的日期 */
BroadcastAction.getDate = function () {

    var date = new Date();
    var dateArray = [];
    dateArray.push(date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

    return dateArray.join('');
};

/* 模态弹窗 */
BroadcastAction.modalWindow = function(text) {

    ModalWindow.show(text);
};



































