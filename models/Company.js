/**
 * Created by yangw on 2016/11/6.
 * 存储公司数据mode
 */

var companySchema = require('./db_schema/company_schema.js').companySchema;
var mongoose = require('./tools/Mongoose');

function Company(companyData) {

    this.companyData = companyData;
}

/* 存储一条公司数据 */
Company.prototype.save = function (callback) {

    var company = this.companyData;
    var db = mongoose.connection;
    var Companys = mongoose.model('Companys', companySchema);

    var newCompanyMode = new Companys(company);
    newCompanyMode.save(function (err, doc) {
        if(err) {
            console.log(err);
            return callback(true);
        }
        callback(false);
    });

};

/* 得到所有公司列表 */
Company.getList = function (callback) {

    var db = mongoose.connection;
    var Companys = mongoose.model('Companys', companySchema);

    var query = Companys.find();
    query.where({});
    query.select({
        company: 1
    });
    query.exec(function (err, docs) {
        if(err){
            console.log(err);
            return callback(err);
        }
        // 成功后返回数据
        callback(null, docs);
    });

};

/* 得到一条公司信息 */
Company.getOne = function (condition, callback) {

    var db = mongoose.connection;
    var Companys = mongoose.model('Companys', companySchema);

    var query = Companys.findOne();
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

module.exports = Company;