/**
 * Created by yangw on 2016/11/6.
 * 招聘信息数据模式
 */

var mongoose = require('./tools/Mongoose');
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
        var db = mongoose.connection;
        var Recruitments = mongoose.model('Recruitments', recruitmentSchema);

        // 如果已经存在公司的招聘数据
        // document.update 更新单个文档
        if(doc){
                var query = Recruitments.findOne();
                query.where({company: company});
                query.exec(function (err, doc) {

                    if(err){
                        console.log(err);
                        return callback(err);
                    }
                    var query = doc.update({
                        $push: {recruitments: recruitment}
                    });
                    query.exec(function (err, results) {

                        if(err){
                            console.log(err);
                            return callback(err);
                        }
                        console.log('%d Documents update.', results);
                        return callback(null);
                    });
                });

            // 存储新的文档
        }else {

                var newRecruitmentMode = new Recruitments({
                    company: company,
                    date: date,
                    recruitments: [recruitment]
                });
                newRecruitmentMode.save(function (err, doc) {
                    if(err) {
                        console.log(err);
                        return callback(true);
                    }
                    callback(false);
                });
        }
    });
};

/* 得到所有在招职位 */
Recruitment.getList = function ( condition, callback ) {

    var db = mongoose.connection;
    var Recruitments = mongoose.model('Recruitments', recruitmentSchema);

        var jobArray = [];
        var query = Recruitments.findOne();
        query.where(condition);
        query.exec(function (err, doc) {
            if(err){
                console.log(err);
                return callback(err);
            }
            // 成功返回
            callback(null, doc.recruitments);
        });
};

/* 得到一条招聘相关数据 */
Recruitment.getOne = function ( condition, callback ) {

    var db = mongoose.connection;
    var Recruitments = mongoose.model('Recruitments', recruitmentSchema);

        var query = Recruitments.findOne();
        query.where(condition);
        query.exec(function (err, doc) {
            if(err){
                console.log(err);
                return callback(err);
            }
            // 成功后返回数据
            callback(null, doc);
        });
};

module.exports = Recruitment;