const unzip = require("unzip-js");
const initSql = require("sql.js");

/** 
 * @param {File} file
 * @returns {Promise<JSON>}
*/

function getDeck(file){
    return new Promise((resolve, reject) => {
        unzip(file,(err,zipFile) => {
            zipFile.readEntries(/**@param {Entry[]} entries */(err,entries)=>{
                for (let entry of entries){
                    if (entry.name == 'collection.anki2'){
                        zipFile.readEntryData(entry,false,(err, readStream) => {
                            databaseCreate(err, readStream).then(parseToJSON).then(resolve);
                        });
                        break;
                    }
                }
            })
        })
    });
}
/**
 * 
 * @param {Database} db 
 */
function parseToJSON(db){
    //TODO: parse database into json
    
    //db.exec();
    return new Promise((resolve,reject)=>resolve({data: "mockJSON"}));
}

/**
 * 
 * @param {Error} err 
 * @param {ReadStream} readStream 
 */
function databaseCreate(err, readStream){
    return new Promise((resolve, reject) => {
        var bufs = [];
        readStream.on('data', (chunk) => {
            bufs.push(chunk);
        });

        readStream.on('end', () => {
            console.log('Data read, init sql.');
            var buf = Buffer.concat(bufs);
            initSql().then(function(SQL){
                var db = new SQL.Database(new Uint8Array(buf));
                resolve(db);
            });
        });
        }
    )
}

module.exports = {getDeck};