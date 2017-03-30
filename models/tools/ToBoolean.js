/**
 * Created by yangw on 2016/12/9.
 * Boolean转化函数
 */

/* Boolean字符串转换函数 */
function ToBoolean(string) {

    if(string == "true" && typeof (string) == 'string'){
        return (string = true);
    }
    if(string === true && typeof (string) == 'boolean'){
        return (string = true);
    }
    return (string = false);
};

module.exports = ToBoolean;