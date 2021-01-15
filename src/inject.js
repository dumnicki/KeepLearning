const cssTemplate = require("./template.css");

var selectedDeckId;

var currentDeck = {
   /**@type {import("./anki").Deck} */
   deck: null, 
   /**@type {import("./anki").Note[]} */
   notes: [], 
   /**@type {import("./anki").Model[]} */
   models: []
};

var renderedCard = {
   /**@type {HTMLElement} */
   index: 0,
   front: null,
   back: null,
   display: disp
}



function disp(html){

}

console.log("inject script started")

const style = document.createElement("style");
style.appendChild(document.createTextNode(cssTemplate.toString()));
document.head.appendChild(style);

const overflow = document.documentElement.style.overflowY;
if(overflow) document.documentElement.style.removeProperty("overflow-y");

document.documentElement.classList.add("no-scroll");

blurPage();

var video = document.querySelector( 'video' );
if ( video ) {
   video.pause();
}


const overlay = document.createElement("div");
overlay.classList.add("kl-overlay");
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
   var frontCardElement = document.createElement("div");
   var cardContent = document.createElement("div");
   frontCardElement.appendChild(cardContent);
   container.appendChild(frontCardElement);

   container.classList.add("kl-container");
   frontCardElement.classList.add("kl-card");
   cardContent.classList.add("card");

   var backCardElement = frontCardElement.cloneNode(true);
   backCardElement.classList.add("kl-card-back");

   container.appendChild(backCardElement);

   style.textContent += parsedCard.css;
   cardContent.innerHTML = parsedCard.frontHTML;
   backCardElement.firstElementChild.innerHTML = parsedCard.backHTML;

   var ansButton = document.createElement("button");
   ansButton.textContent = "answer";
   ansButton.addEventListener("click",() => {
      backCardElement.style.display = "block";
      container.style.transform = "rotateY(180deg)";
      //frontCardElement.firstElementChild.replaceWith();
      container.style.removeProperty("transition");
   });


   ansButton.style.position = "absolute";
   ansButton.style.bottom = "50px";
   ansButton.style.left = "40%";

   frontCardElement.appendChild(ansButton);

   var nextCardBtn = document.createElement("button");
   nextCardBtn.textContent = "next";
   nextCardBtn.addEventListener("click",()=>{
      if(renderedCard.index < currentDeck.deck.cards.length){
         renderedCard.index++;
         backCardElement.style.removeProperty("display");
         container.style.removeProperty("transform");
         container.style.transition = "none";

         nextCard();

      }
   });

   nextCardBtn.style.position = "absolute";
   nextCardBtn.style.bottom = "50px";
   nextCardBtn.style.left = "40%";

   backCardElement.appendChild(nextCardBtn);

   renderedCard.front = frontCardElement.firstElementChild;
   renderedCard.back = backCardElement.firstElementChild;

   overlay.appendChild(container);
}

function nextCard(){
   var id = currentDeck.deck.cards[renderedCard.index].id;
   var html = getHtmlAndCss(id);
   renderedCard.front.innerHTML = html.frontHTML;
   renderedCard.back.innerHTML = html.backHTML;
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

function blurPage(){
   [...document.querySelectorAll("*")].forEach(x=>{
      var hasFixedChild = [...x.querySelectorAll("*")].some(e=>{
         var pos = getComputedStyle(e).getPropertyValue("position");
         return (pos === "fixed");
      });
      var hasBlur = x.parentElement ? x.parentElement.classList.contains("kl-blur") : false;
      
       if(!hasFixedChild && !hasBlur) x.classList.add("kl-blur");
   });
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