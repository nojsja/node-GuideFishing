/**
 * Created by yangw on 2016/10/12.
 */

/* 创建连接 */
conn = new Mongo({ "localhost" : 27017 });

/* admin管理者数据库 */
db = conn.getDB("admin");
if(db.getUser("admin")) {
    db.removeUser("admin");
}else {
    db.createUser({
        'user' : 'admin',
        'pwd' : 'root',
        'roles' : ['userAdminAnyDatabase']
    });
}
db.logout();

/* QN调查问卷数据库 */
db = conn.getDB("QN");
if(db.getUser("zykc")) {
    db.removeUser("zykc");
}else {
    db.createUser({
        'user' : 'zykc',
        'pwd' : 'normal',
        'roles' : ['readWrite', 'dbAdmin']
    });
}

db.logout();