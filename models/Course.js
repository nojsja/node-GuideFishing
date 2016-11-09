/**
 * Created by yangw on 2016/11/8.
 */
/**
 * Created by yangw on 2016/8/23.
 * 课程数据模型
 */

/* 构造函数 */
function Course(picture){
    this.title = picture.title;
    this.date = new Date();
    this.source = picture.source;
    this.author = picture.author;
}

/* 存储一条视频数据 */
Course.prototype.save = function (callback) {

};

/* 读取一个课程数据 */
Course.readOne = function (condition, callback) {
    
};

/* 读取课程列表 */
Course.readList = function (condition, callback) {
    
};

/* 更新一个课程数据 */
Course.update = function (condition, callback) {


};


module.exports = Course;