//var zip = require("zip");
//var sql = require("sql.js");
/*
const ankiFactory = (db) => {
    var getCards = () => {
        var q = db.exec("SELECT decks from col");
        return JSON.parse(q[0].values[0][0]);
    }

    

    return {getCards};
};


function read(file){
    var reader = zip.Reader(file);
    var db;
    reader.forEach(entry => {
        if (entry.getName() == 'collection.anki2'){
            var buf = entry.getData()
            db = new sql.Database(new Uint8Array(buf))
        }
    });
    return ankiFactory(db);
}
*/
function test(){
    console.log("this is test");
}

module.exports = {/*read,*/test};