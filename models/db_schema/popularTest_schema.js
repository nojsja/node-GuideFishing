/**
 * Created by yangw on 2016/10/21.
 * 受欢迎的评测题目模式
 */

/*注:
* */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var popularSchema = new Schema({
    courseType: String,
    testTitle: {
        type: String,
        unique: true,
        required: true
    }
},{collection: 'popular'});

exports.popularSchema = popularSchema;