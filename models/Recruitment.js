/**
 * Created by yangw on 2016/11/6.
 * 招聘信息数据模式
 */

var mongoose = require('mongoose');
var recruitmentSchema = require('./db_schema/recruitment_schema.js').recruitmentSchema;

/* 招聘信息 */
function Recruitment(recruitmentData) {

    this.recruitmentData = recruitmentData;
}

/* 存储一条招聘数据 */
Recruitment.prototype.save = function (callback) {

    var company = this.recruitmentData.company;
    var date = this.recruitmentData.date;
    var recruitment = this.recruitmentData.recruitment;

    // 判断是否已经存在公司的数据
    Recruitment.getOne({
        company: company

    }, function (err, doc) {
        if(err){
            return callback(err);
        }
        console.log(doc);

        // 连接数据库
        var db = mongoose.connect('mongodb://localhost/QN');
        var Recruitments = mongoose.model('Recruitments', recruitmentSchema);

        // 如果已经存在公司的招聘数据
        // document.update 更新单个文档
        if(doc){
            mongoose.connection.once('open', function () {
                var query = Recruitments.findOne();
                query.where({company: company});
                query.exec(function (err, doc) {

                    if(err){
                        console.log(err);
                        mongoose.disconnect();
                        return callback(err);
                    }
                    var query = doc.update({
                        $push: {recruitments: recruitment}
                    });
                    query.exec(function (err, results) {

                        if(err){
                            console.log(err);
                            mongoose.disconnect();
                            return callback(err);
                        }
                        console.log('%d Documents update.', results);
                        mongoose.disconnect();
                        return callback(null);
                    });
                });
            });

            // 存储新的文档
        }else {

            mongoose.connection.once('open', function () {
                console.log('open');
                var newRecruitmentMode = new Recruitments({
                    company: company,
                    date: date,
                    recruitments: [recruitment]
                });
                newRecruitmentMode.save(function (err, doc) {
                    if(err) {
                        console.log(err);
                        mongoose.disconnect();
                        return callback(true);
                    }
                    mongoose.disconnect();
                    callback(false);
                });
            });
        }
    });
};

/* 得到一条招聘相关数据 */
Recruitment.getOne = function ( condition, callback ) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Recruitments = mongoose.model('Recruitments', recruitmentSchema);

    mongoose.connection.once('open', function () {
        var query = Recruitments.findOne();
        query.where(condition);
        query.exec(function (err, doc) {
            if(err){
                console.log(err);
                mongoose.disconnect();
                return callback(err);
            }
            // 成功后返回数据
            mongoose.disconnect();
            callback(null, doc);
        })
    });
};

module.exports = Recruitment;