/**
 * Created by yangw on 2016/11/3.
 * 企业招聘路由管理
 * 显示企业招聘信息
 *
 * 招聘信息包括:
 * company -- 公司名字
 * introduction -- 公司介绍
 * position -- 公司位置
 * imageUrls -- 公司图片
 * job -- 需求岗位
 * dutys -- 岗位职责
 * skills -- 岗位技能
 * treatments -- 工资福利
 * other -- 其它信息
 */

// 招聘对象
var RECRUITMENT = {
    company: '成都汇阳投资顾问有限公司',
    introduction: '成都汇阳投资顾问有限公司成立于2001年，' +
    '是中国证监会批准的专业证券投资咨询机构，' +
    '主要从事企业财务管理顾问、项目投资策划、' +
    '市场信息分析、证券投资咨询等业务。' +
    '目前主要从事证券投资咨询服务工作，' +
    '主要为广大股票投资者提供想咨询和服务。' +
    '2004年8月，证监会授予成都汇阳投资顾问' +
    '有限公司证券投资咨询业务资格（许证号：ZX0179）。' +
    '经过10年的发展，汇阳投资拥有强大的分析研究与营销管理团队，' +
    '现在是CCTV证券投资咨询频道、CDTV2每日财经、' +
    'SCTV3百姓财经等频道长期合作伙伴。',
    position: '武侯区科华北路世外桃源广场B座2217，' +
    '55路 62路 92路 76路 6路 49路及地铁三号线都可以到。',
    imageUrls: [
        { image: "/images/recruitment/company/recruitment1.jpg" }
    ],
    videoUrls: [
        { video: "/videos/company/company.mp4" }
    ],
    recruitments: [
        {
            job: '电话销售/金融投资顾问（1700无责任底薪+长期招）欢迎实习生',
            dutys:[
                { duty: '拓展、开发新客户，销售公司互联网产品，完成预期的业绩目标!' },
                { duty: '1、通过电话、网络为客户提供相关的产品和服务介绍。' },
                { duty: '2、引导客户、促成客户达成进一步的深入工作，并负责跟踪维护；' },
                { duty: '3、收集客户信息，建立和维护客户档案；' },
                { duty: '4、有效进行客户关系的维护和发展，提升客户客户满意度和客户价值。' }
            ],
            skills: [
                { skill: '1、中专以上学历，普通话标准，表达能力强；' },
                { skill: '2、喜欢销售工作，有自我调节能力，从事过地产、保险工作等都优先考虑' },
                { skill: '3、较强的应变能力、善于交流具备良好的服务意识，待人真诚、友善、热情。' },
                { skill: '4、具有一定的网销电销的能力与技巧.优先！' },
                { skill: '5、公司讲究团队合作，为保员工进入公司第一个月就拿到高额提成，要求员工一定要有团队合作的精神' }
            ],
            treatments: [
                { treatment: '1、1700元无责任底薪+高额提成+高额奖金。' },
                { treatment: '2、正常工作时间，法定节假日按国家标准执行，并享有带薪年假、婚假、产假等其他假期。' },
                { treatment: '3、舒适的办公环境，成都最高档的办公楼，中央空调写字楼，环境优美。' },
                { treatment: '4、由公司提供有的意向客户资源，不需要自行寻找。' },
                { treatment: '5、最公平最透明的晋升渠道，任人唯贤；秉承的晋升观念是内部晋升，能者上。' },
                { treatment: '6、企业高级培训师，为您提供专业的培训，能迅速的帮助您提升销售技巧、营销策略。' },
                { treatment: '7、员工旅游+聚餐+K歌+团队拓展等。奖金丰厚年终奖奖金丰厚。' }
            ],
            other: '此岗位欢迎有理想的实习生加入，无经验者公司提供专业的岗前培训，' +
            '对新员工我们坚持传、帮、带的培训原则。业绩优异随时可以转正，转正后无责底薪3500！'
        }
    ]
};

/* 招聘model */
var Recruitment = require('../models/Recruitment.js');
var Company = require('../models/Company.js');
var getDate = require('../models/tools/GetDate.js');

function recruitment(app) {

    /* 获取企业招聘主页面 */
    app.get('/recruitment/index', function (req, res) {

        // 渲染页面
        res.render('recruitment_index', {
            title: "所有招聘",
            slogan: "带渔[授人以渔]"
        });
    });

    /* 企业大厅主页功能 */
    app.post('/recruitment/index', function (req, res) {

        // 动作请求列表
        var actionArray = {
            'getCompanyList': getCompanyList
        };

        // 执行的请求动作
        var action = req.body.action || 'getCompanyList';
        if(actionArray[action]){
            actionArray[action]();
        }else {
            return res.json( JSON.stringify({
                error: true
            }) );
        }

        // action 方法
        function getCompanyList() {

            Company.getList(function (err, companys) {

                if(err){
                    return res.json(JSON.stringify({
                        error: err
                    }));
                }
                return res.json(JSON.stringify({
                    companys: companys
                }));
            });
        }
    });

    /* 获取企业招聘详情页面 */
    app.get('/recruitment/:company', function (req, res) {

        // 返回客户端数据
        res.render('recruitment_company', {
            title: "招聘详情",
            company: req.params.company
        });
    });
    
    /* 获取招聘公司信息 */
    app.post('/recruitment/company', function (req, res) {

        // 需要获取的公司的招聘信息
        var company = req.body.company;
        console.log(company);

        /* 得到招聘公司的信息 */
        Company.getOne({
            company: company

        }, function (err, data) {
            if(err){
                return res.json(JSON.stringify({
                    error: err,
                    company: null
                }));
            }
            res.json(JSON.stringify({
                error: null,
                company: data
            }));
        });
    });

    /* 在系统注册某个公司的信息 */
    app.post('/recruitment/company/save', function (req, res) {

        // 公司信息
        var company = req.body.company || RECRUITMENT.company;
        var introduction = req.body.introduction || RECRUITMENT.introduction;
        var position = req.body.position || RECRUITMENT.position;
        var imageUrls = req.body.imageUrls || RECRUITMENT.imageUrls;
        var videoUrls = req.body.videoUrls || RECRUITMENT.videoUrls;

        var newCompany = new Company({
            company: company,
            introduction: introduction,
            position: position,
            imageUrls: imageUrls,
            videoUrls: videoUrls

        });

        // 数据库调用
        newCompany.save(function (err) {
            if(err){
                return res.json(JSON.stringify({
                    error: err
                }));
            }
            // 成功后返回数据
            res.json(JSON.stringify({
                error: null
            }));
        });

    });

    /* 获取公司招聘职位的页面 */
    app.get('/recruitment/:company/detail/', function (req, res) {

        // 公司名字
        var company = req.params.company;
        res.render('recruitment_detail', {
            title: "招聘详情",
            company: company
        });

    });

    /* 获取招聘公司的所有职位 */
    app.post('/recruitment/detail/all', function (req, res) {

        var company = req.body.company;
        
        Recruitment.getList({ company: company }, function (err, data) {

            if(err){
                return res.json(JSON.stringify({
                    error: err,
                    recruitments: null
                }));
            }
            res.json(JSON.stringify({
                error: null,
                recruitments: data
            }));
        });
    });

    /* 获取招聘公司的某个职位信息 */
    app.post('/recruitment/detail/job', function ( req, res ) {

        // 公司名称和职位名称
        var company = req.body.company;
        var job = req.body.job;
        Recruitment.getOne({
            where: { company: company },
            select: { recruitments: 1 },

        }, function (err, data) {
            if(err){
                return res.json(JSON.stringify({
                    error: error,
                    recruitment: null
                }));
            }
            // 遍历所有招聘信息
            for(var index in data.recruitments){
                if(data.recruitments[index].job == job){
                    return res.json(JSON.stringify({
                        error: null,
                        recruitment: data.recruitments[index]
                    }));
                }
            }

            // 没有得到相关信息
            res.json(JSON.stringify({
                error: true,
                recruitment: null
            }));
        });

    });

    /**
     *  存储一项招聘信息
     *  包括公司名字和发布信息
     *  */
    app.post('/recruitment/detail/save', function (req, res) {

        // 存储对象
        var condition = {
            company: req.body.company || RECRUITMENT.company,
            date: getDate(),
            recruitment: {
                job: req.body.job || RECRUITMENT.recruitments[0].job,
                dutys: req.body.dutys || RECRUITMENT.recruitments[0].dutys,
                skills: req.body.skills || RECRUITMENT.recruitments[0].skills,
                treatments: req.body.treatments || RECRUITMENT.recruitments[0].treatments,
                other: req.body.other || RECRUITMENT.recruitments[0].other
            }
        };

        // 数据库操作
        var newRecruitment = new Recruitment(condition);
        newRecruitment.save(function (err) {
            if(err){
                return res.json(JSON.stringify({
                    error: err
                }));
            }
            res.json(JSON.stringify({
                error: null
            }));
        });

    });
}

module.exports = recruitment;












































