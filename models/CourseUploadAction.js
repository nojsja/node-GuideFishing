/**
 * Created by yangw on 2016/11/9.
 * 处理课程编辑页面课程数据的上传的过程
 * 包括视频, 音频和图片数据类型
 */

/**
 * Created by yangw on 2016/9/8.
 */

// 表单处理
var formidable = require('formidable');
var fs = require('fs');
//保存到数据库
var uploadData = require('./CourseUploadData');

function Upload(req, res) {

    console.log('Upload..');
    //存放表单域和文件
    var form = new formidable.IncomingForm(),files=[],fields=[],docs=[];
    console.log('start upload');

    //临时存放目录
    var tempPath = './temp/';
    form.uploadDir = tempPath;

    //处理普通的表单域
    form.on('field', function(field, value) {
        //console.log(field, value);
        fields.push([field, value]);
        /*处理文件*/
    }).on('file', function(field, file) {
        /* console.log(field, file);*/
        files.push([field, file]);
        docs.push(file);

        var types = file.name.split('.')[1];

        //正则匹配确定文件类型绑定的信息
        var typeInfo = typeRegTest(types);

        try{
            if(!fs.existsSync(typeInfo.storePath)){
                fs.mkdirSync(typeInfo.storePath);
            }
            /*文件上传到临时文件目录下，我们还要将临时文件， 移到我们的上传目录中*/
            fs.rename(file.path, typeInfo.storePath + "/" + file.name, function (err) {
                if(err){
                    console.log(err);
                }else {
                    /*存储信息*/
                    var info = {
                        name : file.name,
                        url : typeInfo.visitPath + "/" + file.name
                    };
                    console.log("type:" + typeInfo.type);
                    //将上传的文件信息存进数据库
                    var upload = new uploadData(typeInfo.type, info);
                    upload.save(function (err) {

                        // 删除临时文件
                        deleteTemp(file);
                        //如果存储错误
                        if(err){
                            console.log(err);
                        }

                    });
                }
            });
        }catch(e){
            console.log(e);
        }

        //删除temp下指定文件
        function deleteTemp(specialFile) {
            //删除该文件
            fs.readdir(tempPath, function (err,files) {
                for(var i = 0; files[i];i++){
                    if(files[i] == specialFile.name){
                        fs.unlink(tempPath + files[i], function (err) {
                            if(err){
                                console.log(err);
                            }
                        });
                    }
                }
            });
        }

        //正则匹配对象, 闭包封装
        var typeRegTest = (function (types) {

            //前缀路径
            var prePath;
            //访问路径
            var visitPath;
            //文件类型
            var type;
            //正则匹配
            var regVideo = /(mp4|flv|rmvb|wmv|mkv)/i;
            var regAudio = /(mp3|ape|wav|ogg|wma)/i;
            var regPicture = /(bmp|jpg|jpeg|svg|png|gif)/i;

            //判断文件类型
            if(regVideo.test(types)){

                return {
                    storePath:  "./public/videos/users/" + req.session.userName,
                    visitPath:  "/videos/users/" + req.session.userName,
                    type: "video"
                }
            }else if(regAudio.test(types)){

                return {
                    storePath: "./public/music/users/" + req.session.userName,
                    visitPath: "/music/users/" + req.session.userName,
                    type: "music"
                }
            }else if(regPicture.test(types)){

                return {
                    storePath: "./public/images/users/" + req.session.userName,
                    visitPath: "/images/users/" + req.session.userName,
                    type: "picture"
                }
                // 上传文件的情况
            }else {

                return {
                    storePath: "./public/files/users/" + req.session.userName,
                    visitPath: "/files/users/" + req.session.userName,
                    type: "file"
                }
            }

        })(types);

    }).on('end', function() {

        console.log('-> upload done');
        // 回写
        res.writeHead(200, {
            'content-type': 'text/plain'
        });

        var out = {
            Resopnse: {
                'result-code': 0,
                timeStamp: new Date(),
            },
            files: docs
        };

        res.end(JSON.stringify(out));

    });

    // 解析包含多媒体数据的表单
    form.parse(req, function(err, fields, files) {

        err && console.log('formidabel error : ' + err);

        console.log('parsing done');
    });
}

module.exports = Upload;
