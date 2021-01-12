var selectedDeckId;

var currentDeck = {
   /**@type {import("./anki").Deck} */
   deck: null, 
   /**@type {import("./anki").Note[]} */
   notes: [], 
   /**@type {import("./anki").Model[]} */
   models: []
};

console.log("inject script started")
var overflow = document.body.style.overflow;

document.body.innerHTML = "<div style=\"filter: blur(4px);\">" + document.body.innerHTML +"</div>";
document.body.style.overflow = "hidden";
var overlay = document.createElement("div");
overlay.style.cssText =
"position: fixed; width: 100%; height: 100%; left: 0; top: 0; background-color: #00000073; z-index: 2147483647;";
document.body.appendChild(overlay);

chrome.runtime.sendMessage("hello");

chrome.storage.local.get("selected",(e) => {
   if(e.selected){
      selectedDeckId = e.selected;
      chrome.storage.local.get("decksStore",ds=>{
         if(ds.decksStore){
            currentDeck = getSelectedDeck(ds.decksStore);
            displayCard(currentDeck.deck.cards[0].id);
         }
      });
   }
});

function displayCard(cardId){
   var parsedCard = getHtmlAndCss(cardId);

   var container = document.createElement("div");
   container.style.cssText = parsedCard.css;
   container.innerHTML = parsedCard.frontHTML;
   overlay.appendChild(container);
}

function getHtmlAndCss(cardId){
   var card = currentDeck.deck.cards.find(c=>c.id===cardId);
   var note = currentDeck.notes.find(n=>n.id===card.nid);
   var model = currentDeck.models.find(m=>m.id===note.mid);
   var template = model.tmpls[card.ord];
   var css = model.css;
   var frontHTML = template.front;
   var backHTML = template.back;
   console.log(frontHTML);
   model.flds.forEach(field =>{
      console.log(field.name);
      frontHTML = frontHTML.replace(new RegExp("{{"+field.name+"}}",'g'),note.fld[field.ord]);
      backHTML = backHTML.replace(new RegExp("{{"+field.name+"}}",'g'),note.fld[field.ord]);
   });
   backHTML = backHTML.replace(new RegExp("{{FrontSide}}",'g'),frontHTML);

   return {css: css, frontHTML: frontHTML, backHTML: backHTML};
}

/**
 * @param {import('./anki').DecksStore} ds */
 function getSelectedDeck(ds){
   var deck = ds.decks.find(e => e.id === selectedDeckId);
   var notes = ds.notes.filter(e => deck.cards.some(c => c.nid === e.id));
   var models = ds.models.filter(e => notes.some(n => n.mid === e.id));
   return {deck: deck, notes: notes, models: models};
}


/**
 *  top: 50%;
    left: 50%;
    display: block;
    position: fixed;
    width: 200px;
    height: 100px;
    margin: -100px -50px;
    background-color: red;
    text-align: center;
    vertical-align: middle;
    line-height: 100px;
 */