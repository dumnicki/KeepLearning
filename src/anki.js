const unzip = require("unzip-js");
const initSql = require("sql.js");

/**
 * @typedef {Object} Note
 * @property {Number} id - id of the note
 * @property {Number} mid - id of the model
 * @property {String[]} fld - fields of the note
 */

 /**
 * @typedef {Object} Card
 * @property {Number} id - id of the card
 * @property {Number} nid - id of the note
 * @property {Number} ord - position of template in model array of templates
 */

 /**
 * @typedef {Object} Template
 * @property {String} front - front HTML of the card
 * @property {String} back - back HTML of the card
 */

 /**
 * @typedef {Object} Field
 * @property {String} name - name of field
 * @property {Number} ord - position of field in fld array of note
 */

 /**
 * @typedef {Object} Model
 * @property {Number} id - id of the model
 * @property {Field[]} flds - fields of the model
 * @property {Template[]} tmpls - templates of the model
 * @property {String} css - css to be used in model
 */

 /**
  * @typedef {Object} Deck
  * @property {Number} id - id of the deck
  * @property {String} name - name of the deck
  * @property {Card[]} cards - cards in this deck
  */

  /**
  * @typedef {Object} DecksStore
  * @property {Deck[]} decks - all decks
  * @property {Model[]} models - all models
  * @property {Note[]} notes - all notes
  */


/** 
 * @param {File} file
 * @returns {Promise<DecksStore>}
*/
function getDeck(file){
    return new Promise((resolve, reject) => {
        unzip(file,(err,zipFile) => {
            zipFile.readEntries(/**@param {Entry[]} entries */(err,entries)=>{
                for (let entry of entries){
                    if (entry.name == 'collection.anki2'){
                        zipFile.readEntryData(entry,false,(err, readStream) => {
                            databaseCreate(err, readStream).then(parseDatabase).then(resolve);
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
function parseDatabase(db){
    const col = db.exec("SELECT models,decks FROM col")[0];
    const decksJSON = JSON.parse(col.values[0][1]);
    const modelsJSON = JSON.parse(col.values[0][0]);
    const cards = db.exec("SELECT id,nid,did,ord FROM cards")[0].values;
    const notes = db.exec("SELECT id,mid,flds FROM notes")[0].values;
    
    db.close();

    /**@type {Deck[]} */
    var decks = [];

    for(let deck in decksJSON){
        let id = Number.parseInt(deck);

        let deckCards = cards.filter(e => e[2] === id).map(e =>{
            return {
                id: e[0],
                nid: e[1],
                ord: e[3]
            }
        });

        if(deckCards.length) decks.push({id: id, name: decksJSON[deck].name, cards: deckCards});
    }

    /**@type {Model[]} */
    var models = [];

    for(let model in modelsJSON){
        let id = Number.parseInt(model);
        /**@type {Field[]} */
        let flds = modelsJSON[model].flds;
        flds.forEach(fld =>
            ["media","sticky","rtl","font","size"].forEach(e=>{delete fld[e];})
        );
        /**@type {Template[]} */
        let tmpls = modelsJSON[model].tmpls.map(tmpl =>{
            return {front: tmpl.qfmt, back: tmpl.afmt};
        });
        models.push({id: id, flds: flds, tmpls: tmpls, css: modelsJSON[model].css});
    }

    var notesArr = notes.map(e => {
        return {id: Number.parseInt(e[0]), mid: Number.parseInt(e[1]), fld: e[2].split('')}
    });
    return new Promise((resolve,reject)=>resolve({decks: decks, models: models, notes: notesArr}));
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