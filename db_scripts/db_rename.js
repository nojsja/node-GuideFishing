/**
 * Created by yangw on 2016/11/14.
 */
/* 重命名数据库 */
conn = new Mongo({ "localhost" : 27017 });
db = conn.getDB("QN");

var source = "QN";
var dest = "GuideFishing";
var colls = db.getSiblingDB(source).getCollectionNames();
for (var i = 0; i < colls.length; i++) {
    var from = source + "." + colls[i];
    var to = dest + "." + colls[i];
    db.adminCommand({renameCollection: from, to: to});
}