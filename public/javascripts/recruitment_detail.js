/**
 * Created by yangw on 2016/11/7.
 * 公司职位招聘页面详情
 */

$(function () {

    $('.company').fadeIn();
    // 获取职位列表
    RecruitmentDetail.getJobList();
});

/* 页面全局变量 */
// recruitments -- 所有在招职位
var RecruitmentDetail = {

    recruitments: null
};

/* 获取所有职位列表 */
RecruitmentDetail.getJobList = function () {

    var url = '/recruitment/detail/all';
    var company = $('.company').text().trim();

    $.post(url, { company: company }, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.error){
            return alert('读取错误!');
        }
        // 更新数据依赖
        RecruitmentDetail.recruitments = JSONobject.recruitments;
        // 更新页面
        RecruitmentDetail.updatePage();
    }, "JSON");
};

/* 获取一个职位 */
RecruitmentDetail.getOneJob = function () {


};

/* 更新一个职位的页面 */
RecruitmentDetail.updatePage = function () {

    // 更新招聘职位
    for(var index in RecruitmentDetail.recruitments){

        // 闭包 -- 当有回调存在的时候使用
        (function (index) {
            var recruitment = RecruitmentDetail.recruitments[index];
            // 构建dom
            var $itemDiv = $('<div class="recruitment-item">');

            // isHidden标记所有职位信息的状态 -- 是否隐藏
            var $pin = $('<span isHidden="true" class="glyphicon glyphicon-resize-full">');
            // 绑定事件
            $pin.click(function () {

                // 隐藏
                if($(this).attr('isHidden') == "true"){
                    $(this).prop('class', 'glyphicon glyphicon-resize-small');
                    $(this).attr('isHidden', 'false');
                    $itemDiv.children('.hiddenable').fadeIn();
                    // 显示
                }else {
                    $(this).prop('class', 'glyphicon glyphicon-resize-full');
                    $(this).attr('isHidden', 'true');
                    $itemDiv.children('.hiddenable').fadeOut('fast');
                }
            });

            $pin.appendTo($itemDiv);

            // 职位名称
            var $job = $('<div class="item-job translate">');
            var $jobTitle = $('<div class="item-title">');
            $jobTitle.text('职位名称').appendTo($itemDiv);
            $job.text(recruitment.job).appendTo($itemDiv);

            // 岗位职责
            var $duty = $('<div class="item-duty translate hiddenable">');
            var $dutyTitle = $('<div class="item-title hiddenable">');
            $dutyTitle.text('岗位职责')
                .css('display', 'none')
                .appendTo($itemDiv);
            for(var i in recruitment.dutys){
                var $dutyItem = $('<div class="item-duty-item">');
                $dutyItem.text(recruitment.dutys[i].duty);

                $duty.append($dutyItem);
            }
            $duty
                .css('display', 'none')
                .appendTo($itemDiv);

            // 任职资格
            var $skill = $('<div class="item-skill translate hiddenable">');
            var $skillTitle = $('<div class="item-title hiddenable">');
            $skillTitle.text('任职资格')
                .css('display', 'none')
                .appendTo($itemDiv);
            for(var j in recruitment.skills){
                var $skillItem = $('<div class="item-skill-item">');
                $skillItem.text(recruitment.skills[j].skill);

                $skill.append($skillItem);
            }
            $skill
                .css('display', 'none')
                .appendTo($itemDiv);

            // 薪资福利
            var $treatment = $('<div class="item-treatment translate hiddenable">');
            var $treatmentTitle = $('<div class="item-title hiddenable">');
            $treatmentTitle.text('薪资福利')
                .css('display', 'none')
                .appendTo($itemDiv);
            for(var k in recruitment.treatments){
                var $treatmentItem = $('<div class="item-treatment-item">');
                $treatmentItem.text(recruitment.treatments[k].treatment);

                $treatment.append($treatmentItem);
            }
            $treatment
                .css('display', 'none')
                .appendTo($itemDiv);

            // 其它信息
            var $other = $('<div class="item-other translate hiddenable">');
            var $otherTitle = $('<div class="item-title hiddenable">');
            $otherTitle.text('其它')
                .css('display', 'none')
                .appendTo($itemDiv);
            $other.text(recruitment.other)
                .css('display', 'none')
                .appendTo($itemDiv);

            // 添加到列表里面
            $('#recruitmentList').append($itemDiv);
        })(index)
    }
};
