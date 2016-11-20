/**
 * Created by yangw on 2016/11/16.
 * 课程直播间
 */

/* 页面准备好后触发 */
$(function () {

    // 初始化socket连接
    broadcastAction.socketInit();
    // 初始化页面事件
    broadcastAction.pageEventBind();
    // 绑定消息观察者事件
    broadcastAction.watcherInit(broadcastAction.message.send);
    broadcastAction.watcherInit(broadcastAction.message.received);
    // 注入激活观察者函数
    broadcastAction.watcherActive();
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
 * reader -- 文件读取对象fileReader
 * */

var broadcastAction = {

    socket: {},
    courseName: "",
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
    }
};

/* 初始化函数 */
broadcastAction.socketInit = function () {

    // 弹出窗口
    var userName  = "Johnson" || prompt('请输入昵称');
    $('#name').text(userName);

    // 连接到服务器,绑定观察者对象
    broadcastAction.socket = io();
    // 监听事件
    // 所有消息类型是可以自定义的
    broadcastAction.socket.on('connect', function () {
        var name = $('#name').text() || '匿名';
        broadcastAction.socket.emit('join', {
            name: name
        });
    });

    // 系统消息
    broadcastAction.socket.on('systemMessage', function (data) {

        broadcastAction.message.received.value = {
            message: data.msg,
            from: data.from,
            type: data.type,
            path: data.path || ""
        };
        broadcastAction.message.received.trigger('systemMessage', {
            message: data.msg,
            from: data.from,
            type: data.type,
            path: data.path || ""
        });

    });
    
    // 用户聊天消息
    broadcastAction.socket.on('newMessage', function (data) {

        broadcastAction.message.received.value = {
            message: data.msg,
            from: data.from,
            type: data.type,
            path: data.path || ""
        };
        broadcastAction.message.received.trigger('newMessage', {
            message: data.msg,
            from: data.from,
            type: data.type,
            path: data.path || ""
        });

    });

    // 服务器请求上传更多数据
    broadcastAction.socket.on('moreData', function (data) {

        // 触发上传
        broadcastAction.message.received.trigger('moreData', {
            percent: data.percent,
            position: data.position
        });

    });

    // 服务器文件上传完成
    broadcastAction.socket.on('uploadDone', function () {

        // 触发事件
        broadcastAction.message.received.trigger('uploadDone');
    });

};

/* 页面事件绑定 */
broadcastAction.pageEventBind = function () {

    // 当前课程名(也是直播间的名字)
    broadcastAction.courseName = $('.broadcast-room').text().trim();

    // 上传事件绑定
    broadcastAction.upload = {
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
        broadcastAction.message.send.trigger('send');
    });

    // messageInput键盘事件绑定
    $('#messageInput').on('keydown', function (e) {

        // 事件代码Enter
        if(e.which == 13){
            broadcastAction.message.send.trigger('send');
        }
    });

    // 文件选中上传事件
    $('#fileChoose').on('change', function () {

        console.log('on change');
        //判断浏览器是否支持FileReader接口
        if(typeof FileReader == 'undefined'){
            //使选择控件不可操作
            $('#fileChoose').setAttribute("disabled","disabled");
            return broadcastAction.modalWindow('你的浏览器不支持读取本地文件!');
        }

        // 获取文件
        var file = document.getElementById('fileChoose').files[0];

        if(file){
            broadcastAction.file.origin = file;
            console.log(file.size + " + " + file.name);
            broadcastAction.file.reader = new FileReader();
            // 注意这儿载入的是文件分片后的数据
            // 这个需要服务器返回第一次返回后客户端确认信息
            broadcastAction.file.reader.onload = function (event) {

                // 为2是读取成功
                console.log("readyState: " + this.readyState);

                var data = this.result || event.target.result;
                console.log('reader onload.');
                /* 通过内部的result对象取到读取后的数据 */
                broadcastAction.socket.emit('upload', {
                    "Name": broadcastAction.file.origin.name,
                    "Segment": data
                });
            };
            console.log('start');
            // 触发开始上传事件
            // 等待服务器发回允许上传的回调信息后开始载入文件流式传输到服务器
            broadcastAction.socket.emit('start', {
               "Name": broadcastAction.file.origin.name,
                "Size": broadcastAction.file.origin.size,
                "CourseName": broadcastAction.courseName
            });
        }
    });
    
    // 选择并上传文件到服务器, 服务器再广播到房间
    $('#fileSend').click(function () {

        $('#fileChoose').click();
    });
    
};

/* 观察者模式声明 */
broadcastAction.watcherInit = function (obj) {

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
broadcastAction.watcherActive = function () {

    //--- 发送消息 ---//

    // 发送消息
    broadcastAction.message.send.listen('send', send);

    // 向服务器发送消息函数,事件类型定义为send
    function send() {
        // 发送检测
        var message = $('#messageInput').val().trim();
        // 更新数据依赖
        broadcastAction.message.send.value = message;
        if(!message){
            return broadcastAction.modalWindow('请输入要发送的消息!');
        }
        // 置空消息
        $('#messageInput').val('');
        // 发送
        broadcastAction.socket.send(message);
    }

    //--- 接收消息 ---//

    // 接收系统消息
    broadcastAction.message.received.listen('systemMessage', receiveSystemMsg);
    // 接收用户消息
    broadcastAction.message.received.listen('newMessage', receiveNewMsg);
    // 接收上传开始上传文件的信息
    broadcastAction.message.received.listen('moreData', startUpload);
    // 文件上传完成
    broadcastAction.message.received.listen('uploadDone', uploadDone);

    // 上传完成
    function uploadDone(info) {

        // 更新页面进度条
        broadcastAction.upload.setProgress('100%')
            .hidden();
        // 清除缓存
        broadcastAction.file.reader = null;
        broadcastAction.file.origin = null;
    };

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
        var currentFile = broadcastAction.file.origin;

        // 更新页面进度条
        broadcastAction.upload.show();
        broadcastAction.upload.setProgress(percent);

        // 裁切文件并兼容浏览器
        if(currentFile.slice){
            newFile = currentFile.slice(position, position +
                Math.min(length, currentFile.size - position));

        }else if(broadcastAction.file.origin.webkitSlice){
            newFile = currentFile.webkitSlice(position, position +
                Math.min(length, currentFile.size - position));

        }else if(broadcastAction.file.origin.mozSlice){
            newFile = currentFile.mozSlice(position, position +
                Math.min(length, currentFile.size - position));

        }
        // 触发文件上传二进制
        if(newFile){
            broadcastAction.file.reader.readAsBinaryString(newFile);
        }


    }

    // 接收系统消息
    function receiveSystemMsg(info) {

        // 消息发送者和消息内容和消息类型
        var system = "SYSTEM => ";
        var msg = info.args.message;
        var type = info.type;

        // 添加DOM
        var $messageList = $('.message-list');
        var $messageItem =
            $('<div class="message-list-item message-list-item-system">');

        $messageItem.text(system + msg);
        $messageList.append($messageItem);

        // 滚到页面底部
        var div = document.getElementById('messageList');
        div.scrollTop = div.scrollHeight;
    }

    // 接收用户新消息
    function receiveNewMsg(info) {

        // 集成消息对象
        var info = {
            // 消息发送者和消息内容,媒体类型数据的url
            from: info.args.from,
            msg: info.args.message,
            path: info.args.path || "",
            // 消息的所属类型,对应的有text,video,audio
            type: info.args.type
        };

        // 执行DOM更新
        broadcastAction.newMessageUpdate(info);
    }

};

/* 页面消息更新 */
broadcastAction.newMessageUpdate = function (info) {

    // 消息参数
    var from = info.from,
        msg = info.msg,
        path = info.path,
        type = info.type;

    // 选择方法
    var update = {

        text: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item message-list-item-user">');

            $messageItem.text(from + '说: ' + msg);
            $messageList.append($messageItem);
            // 滚到页面底部
            var div = document.getElementById('messageList');
            div.scrollTop = div.scrollHeight;
        },

        videos: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item">');

            // 文本消息
            var $messageItemText =
                $('<div class="message-list-item-text">');
            $messageItemText.text(from + ': ')
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
            var div = document.getElementById('messageList');
            div.scrollTop = div.scrollHeight;
        },

        audios: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item">');

            // 文本消息
            var $messageItemText =
                $('<div class="message-list-item-text">');
            $messageItemText.text(from + ': ')
                .appendTo($messageItem);

            // 视频消息
            var $messageItemAudio =
                $('<audio class="message-list-item-audio">');
            $messageItemAudio
                .prop({
                    src: path,
                    controls: 'controls'
                })
                .appendTo($messageItem);

            // 添加到页面
            $messageList.append($messageItem);
            // 滚到页面底部
            var div = document.getElementById('messageList');
            div.scrollTop = div.scrollHeight;
        },

        images: function () {

            // 添加DOM
            var $messageList = $('.message-list');
            var $messageItem =
                $('<div class="message-list-item">');

            // 文本消息
            var $messageItemText =
                $('<div class="message-list-item-text">');
            $messageItemText.text(from + ': ')
                .appendTo($messageItem);

            // 视频消息
            var $messageItemVideo =
                $('<img class="message-list-item-image">');
            $messageItemVideo
                .prop( {src: path} )
                .appendTo($messageItem);

            // 添加到页面
            $messageList.append($messageItem);
            // 滚到页面底部
            var div = document.getElementById('messageList');
            div.scrollTop = div.scrollHeight;
        }
    };

    update[type]();

};

/* 模态弹窗 */
broadcastAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};



































