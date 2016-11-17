/**
 * Created by yangw on 2016/11/16.
 * 课程直播模式
 * 引用socket.io
 */

// 解码中文url
var url = require('url');

// 课程直播模块
function courseBroadcast(io){

    // 保存所有聊天室房间的数组
    var roomUser = [];

    // 客户端新建连接
    io.on('connection', function (socket) {

        console.log('new socket connection coming...');
        // 获取当前用户连接的url进一步获取url房间号
        var url = socket.request.headers.referer;
        console.log('req headers: '+ JSON.stringify(socket.request.headers));
        // 分割地址字符串,数组的最后一个设置成房间号
        var split_arr = url.split('/');
        var roomId = split_arr[split_arr.length - 1];
        // 解码中文字符
        roomId = decodeURIComponent(roomId);
        console.log('roomId: ' + roomId);

        // 用户姓名
        var user = '';
        // 监听连接的其它信息
        // 加入房间
        socket.on('join', function (userName) {

            console.log('join');
            user = userName;
            // 将用户归类到房间
            if(!roomUser[roomId]){
                roomUser[roomId] = [];
            }
            // 将用户加入房间
            roomUser[roomId].push(user);
            // 创建socket房间
            socket.join(roomId);
            // 触发系统消息
            socket.to(roomId).emit('systemMessage', user + '加入了房间!');
            socket.emit('systemMessage', user + '加入了房间!');
        });

        // 监听来自客户端的消息
        socket.on('message', function (msg) {

            console.log('message');
            // 验证如果用户不在房间则不发消息
            if(roomUser[roomId].indexOf(user) < 0){
                return false;
            }
            // 发送给执行用户
            socket.to(roomId).emit('newMessage', msg, user);
            socket.emit('newMessage', msg, user);
        });

        // 关闭连接
        socket.on('disconnect', function () {

            console.log('disconnect');
            // 离开房间
            socket.leave(roomId, function (err) {
               if(err){
                   console.log('leave room error!');
               }else {
                   var index = roomUser[roomId].indexOf(user);
                   if(index !== -1){
                       // 数组删除
                       roomUser[roomId].splice(index, 1);
                       // 在房间内发布离开的消息
                       socket.to(roomId).emit('systemMessage', user + '离开了房间!');
                   }
               }
            });
        });
    });
}

module.exports = courseBroadcast;