/**
 * Created by yangw on 2016/11/6.
 * 存储公司数据mode
 */

var companySchema = require('./db_schema/company_schema.js').companySchema;
var mongoose = require('mongoose');

function Company(companyData) {

    this.companyData = companyData;
}

/* 存储一条公司数据 */
Company.prototype.save = function (callback) {

    var company = this.companyData;
    var db = mongoose.connect('mongodb://localhost/QN');
    var Companys = mongoose.model('Companys', companySchema);

    //连接打开后
    mongoose.connection.once('open', function () {

        console.log('open');
        var newCompanyMode = new Companys(company);
        newCompanyMode.save(function (err, doc) {
            if(err) {
                console.log(err);
                mongoose.disconnect();
                return callback(true);
            }
            mongoose.disconnect();
            callback(false);
        });
    });
};

/* 得到所有公司列表 */
Company.getList = function (callback) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Companys = mongoose.model('Companys', companySchema);

    mongoose.connection.once('open', function () {
        var query = Companys.find();
        query.where({});
        query.select({
            company: 1
        });
        query.exec(function (err, docs) {
            if(err){
                console.log(err);
                mongoose.disconnect();
                return callback(err);
            }
            // 成功后返回数据
            mongoose.disconnect();
            callback(null, docs);
        })
    });
};

/* 得到一条公司信息 */
Company.getOne = function (condition, callback) {

    var db = mongoose.connect('mongodb://localhost/QN');
    var Companys = mongoose.model('Companys', companySchema);

    mongoose.connection.once('open', function () {
        var query = Companys.findOne();
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

module.exports = Company;