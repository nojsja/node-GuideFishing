/**
 * Created by yangw on 2016/11/14.
 */
/* 重命名数据库 */
conn = new Mongo({ "localhost" : 27017 });
db = conn.getDB("GuideFishing");

db.adminCommand({renameCollection: 'tests', to: 'test'});