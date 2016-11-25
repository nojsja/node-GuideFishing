/**
 * Created by yangw on 2016/11/16.
 * 课程直播模式
 * 引用socket.io
 */

// 解码中文url
var url = require('url');
// 文件操作模块
var fs = require('fs');
// 定位文件
var locateFromRoot = require('./tools/LocateFromRoot');
// 初始化观察者方法
var ObserverInit = require('./tools/ObserverInit');

// 课程直播模块
function courseBroadcastAction(io){

    // 保存所有聊天室房间的组数 -- 在全局范围下
    var roomUser = [];
    // 所有聊天室的原始消息记录,以便数据库保存数据 -- 在全局范围下
    var courseOrigin = [];

    // 客户端新建连接
    io.on('connection', function (socket) {
        // 客户端的socket对象在断开后会自动重连,
        // 也就是说只需要保存服务器端的socket连接信息
        // 每个socket连接都有其固有的属性 -- isAdmin

        console.log('new socket connection coming...');
        // 该客户端上传的文件
        var Files = {};
        try {
            // 获取当前用户连接的url进一步获取url房间号
            var url = socket.request.headers.referer;
            // 分割地址字符串,数组的最后一个设置成房间号
            var split_arr = url.split('/');

            var roomId = split_arr[split_arr.length - 1];
            // 解码中文字符
            roomId = decodeURIComponent(roomId);
            console.log('roomId: ' + roomId);

        }catch (e){
            roomId = '测试';
            console.log(e);
        }

        // 用户姓名
        var user = {
            name: '',
            isAdmin: ''
        };

        // 初始化当前课程数据
        if(!courseOrigin[roomId]){

            courseOrigin[roomId] = {

                // 将观察者和数据放在同一个this作用域下便于读取数据
                info: {
                    videos: [],
                    images: [],
                    audios: [],
                    texts: []
                },
                watcherList: [],
                watcherListen: function (type, fn) { },
                watcherTrigger: function (type, args) { },
                watcherRemove: function (type, fn) { }
            };
            // 初始化观察者并开启监听
            ObserverInit(courseOrigin[roomId]);

            // 在全局变量中保存当前直播课程的信息
            // let -- ECMAScript6关键字,制造块级作用域
            let videosListen = function(videoInfo) {

                this.info.videos.push(videoInfo);
            }
            let imagesListen = function (imageInfo) {

                this.info.images.push(imageInfo);
            }
            let audiosListen = function (audioInfo) {

                this.info.audios.push(audioInfo);
            }
            let textsListen = function (textInfo) {

                this.info.texts.push(textInfo);
            }

            courseOrigin[roomId].watcherListen("videos", videosListen);
            courseOrigin[roomId].watcherListen("images", imagesListen);
            courseOrigin[roomId].watcherListen("audios", audiosListen);
            courseOrigin[roomId].watcherListen("texts", textsListen);
        }

        // 监听连接的其它信息
        // 加入房间
        socket.on('join', join);
        // 监听来自客户端的消息
        socket.on('message', message);
        // 客户端录音上传
        socket.on('record',record);
        // 文件开始上传信号
         socket.on('start', start);
        // 文件上传中
        socket.on('upload', upload);
        // 关闭连接
        socket.on('disconnect', disconnect);


        /* 连接加入 */
        function join(data) {

            console.log('join');
            // 获取用户名和权限
            user.name = data.name;
            user.isAdmin = data.isAdmin;
            // 为socket连接绑定权限
            socket.isAdmin = data.isAdmin;

            // 将用户归类到房间
            if(!roomUser[roomId]) {
                roomUser[roomId] = [];
            }

            // 将用户加入房间
            roomUser[roomId].push( JSON.stringify(user) );
            // 创建socket房间
            socket.join(roomId);
            // 触发系统消息
            socket.to(roomId).emit('systemMessage', {
                msg: user.name + '加入了房间!',
                type: 'text',
                from: 'system'
            });
            socket.emit('systemMessage', {
                msg: '欢迎加入房间!',
                type: 'text',
                from: 'system'
            });

            // 观察者方法
        }

        /* 有新消息 */
        function message(msg) {

            console.log('message');
            console.log('isAdmin: ' + socket.isAdmin);
            // 验证如果用户不在房间则不发消息
            if(roomUser[roomId].indexOf( JSON.stringify(user) ) < 0){
                return false;
            }
            // 发送给房间的其它用户
            socket.to(roomId).emit('newMessage', {
                from: user.name,
                msg: msg,
                type: 'text'
            });
            // 给自己发送相同的消息
            socket.emit('newMessage', {
                from: "我",
                msg: msg,
                type: 'text'
            });
        }

        // 音频数据二进制存储
        function record(info) {

            console.log('record data recieving');

            // 创建录音数据
            var recordData = {
                base64Data: info.base64Data,
                index: info.index,
                courseName: info.courseName,
                action: info.action
            };

            if(Files[recordData.courseName]){
                Files[recordData.courseName].record = {
                    data: ''
                };
            }else {
                console.log('[record init]: roomId/courseName not found -- ' + recordData.courseName);
            }

            // 组合替换字符串 [data:audio/wav;base64,]base64编码前缀
            var base64String = '' + recordData.base64Data;
            base64String = base64String.replace('data:audio/wav;base64,', '');

            // base64编码的字符串
            Files['recorded'].data = base64String;

            // 将字符串转化成buffer
            var buffer = new Buffer(base64String, 'base64'),
            // buffer的写入长度
            bufferLength = buffer.length,
            // 文件的写入位置
            filePosition = null,
            // buffer的起始位置
            bufferPosition = 0;

            // 存储路径
            var savePath = locateFromRoot('/public/temp/');
            if(!fs.existsSync(savePath)){
                console.log('build dir.');
                fs.mkdirSync(savePath);
            };

            // 以追加方式打开磁盘文件用于上传准备工作
            fs.open([savePath, index, '.wav'].join(''), 'a', function (err, fd) {

                if (err){
                    console.log('[start] file open error: ' + err.toString());
                }else {
                    // 拿到文件描述符
                    Files['recorded'].handler = fd;
                    fs.write(Files['recorded'].handler,
                        buffer,
                        bufferPosition,
                        bufferLength,
                        filePosition,

                        function (err, written) {

                            if(err){
                                console.log('[file write]: ' + err);
                            }
                            delete Files['recorded'];
                            fs.close(fd, function () {
                               console.log('done');
                            });
                    });
                }

            });
        }

        
        /* 文件开始上传信号 */
        function start(info){

            console.log('start...');
            // 文件名和文件大小和文件类型,课程名字
            var name  = info.Name,
                size = info.Size,
                courseName = info.CourseName;

            /*** 文件大小,data数据缓冲区(最大10M),downloaded已上传的长度,handler文件描述符 ***/
            Files[name] = {
                fileSize: size,
                data: '',
                downloaded: 0,
                handler: null,
                filePath: "",
                visitPath: "",
                type: 'files'
            };

            console.log('name+size: ' + name + size);

            //正则匹配判断文件类型
            var regVideo = /(mp4|flv|rmvb|wmv|mkv|avi)/i,
                regAudio = /(mp3|ape|wav|ogg|wma|aac|flac)/i,
                regImage = /(bmp|jpg|jpeg|svg|png|gif)/i;

            // 类型结尾
            if(regAudio.test( name.split('.').pop()) ){
                Files[name].type = "audios";
            }else if(regImage.test( name.split('.').pop() )){
                Files[name].type = "images";
            }else if(regVideo.test( name.split('.').pop() )){
                Files[name].type = "videos";
            };

            // 验证文件的存放地址是否存在
            var prePath = locateFromRoot( ['/public/', Files[name].type, '/courses/', courseName].join('') );
            // 文件的客户端访问地址
            Files[name].visitPath = ['/', Files[name].type, '/courses/', courseName, '/', name].join('');
            // 不存在则创建目录
            if(!fs.existsSync(prePath)){
                console.log('build dir.');
                fs.mkdirSync(prePath);
            };
            // 完整存储地址
            var filePath = locateFromRoot( ['/public/', Files[name].type, '/courses/',
                courseName, '/', name].join('') );

            console.log('filePath:'　+ filePath);
            Files[name].filePath = filePath;

            // 以追加方式打开磁盘文件用于上传准备工作
            fs.open(Files[name].filePath, 'a', function (err, fd) {

                if (err){
                    console.log('[start] file open error: ' + err.toString());
                }else {
                    Files[name].handler = fd;

                    console.log('ready to get data.');
                    // 触发客户端从零开始上传数据
                    socket.emit('moreData',{
                        position: 0,
                        percent: 0
                    });
                }

            });

            // 获取上传百分比
            Files[name].getPercent = function () {

                return parseInt( (this.downloaded / this.fileSize) * 100 ) + "%";
            };

            // 获取文件已经上传的长度 -- 用于客户端截取文件上传, 单位字节
            Files[name].getPosition = function () {

                // 减小数字, 1024千字节
                var length = 1048576;
                return this.downloaded / length;
            };

        }

        /* 文件上传中 */
        function upload(info) {

            console.log('uploading...');
            // 名字和分段数据
            var name = info.Name,
                segment = info.Segment;

            // 已经上传的长度
            Files[name].downloaded += segment.length;
            // 组合二进制字符(最大10M的缓存)
            Files[name].data += segment;

            // 文件上传完毕
            if(Files[name].downloaded == Files[name].fileSize){

                console.log('upload done.');
                fs.write(Files[name].handler, Files[name].data, null, 'binary',function (err, written) {

                    var msgInfo = {
                        from: user.name,
                        msg: name,
                        type: Files[name].type,
                        path: Files[name].visitPath
                    };
                    // 向客户端发送上传结束消息
                    socket.emit('uploadDone');
                    // 向其它用户发送消息
                    socket.to(roomId).emit('newMessage', msgInfo);
                    // 向自己发送消息
                    socket.emit('newMessage', msgInfo);

                    // 删除缓存文件
                    delete Files[name];
                });

              // 10M的buffer被使用完
            }else if(Files[name].data.length > 1024 * 1024 * 10){

                console.log('file splice.');
                fs.write(Files[name].handler, Files[name].data, null, 'binary',function (err, written) {
                    Files[name].data = '';
                    socket.emit('moreData', {
                        'position': Files[name].getPosition(),
                        'percent': Files[name].getPercent()
                    });
                });

            // 继续填充缓冲区
            }else {

                console.log('more data in  position: ' + Files[name].getPosition() +
                    " " + Files[name].getPercent());
                socket.emit('moreData', {
                    'position': Files[name].getPosition(),
                    'percent': Files[name].getPercent()
                });
            }
        }

        /* 客户端连接关闭 */
        function disconnect() {

            console.log('disconnect');
            // 离开房间
            socket.leave(roomId, function (err) {
                if(err){
                    console.log('leave room error!');
                }else {
                    var index = (roomUser[roomId] || []).indexOf( JSON.stringify(user) );
                    if(index !== -1){
                        // 数组删除
                        roomUser[roomId].splice(index, 1);
                        // 在房间内发布离开的消息
                        socket.to(roomId).emit('systemMessage', {
                            from: 'system',
                            msg : user.name + '离开了房间!'
                        });
                    }
                }
            });
        }


    });
}

module.exports = courseBroadcastAction;