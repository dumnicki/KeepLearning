const {getDeck} = require("./anki");

const emptyDecksStore = {
  decks: [],
  models: [],
  notes: []
}

var selectedDeckId = 0;

const decksList = document.getElementById("decks-list");

document.getElementById("test-url").textContent = chrome.runtime.getURL("popup.html");
decksList.childNodes.forEach(c => c.addEventListener("click",onDeckSelect));

loadOptions();
loadDeckEntries();


const cardNumInput = document.getElementById("card-num-input");
const timeInput = document.getElementById("time-input");

cardNumInput.addEventListener("change",updateOptions);
timeInput.addEventListener("change",updateOptions);

const fileImport = document.getElementById("import-btn"),
  fileElem = document.getElementById("file-elem");

fileImport.addEventListener(
  "click",
  function (e) {
    e.preventDefault();
    if (fileElem) {
      fileElem.click();
    }
  },
  false
);

fileElem.addEventListener("change",handleFile, false);

async function handleFile(){
    const deck = await getDeck(this.files[0]);
    chrome.storage.local.get({decksStore:emptyDecksStore}, ds =>{
      deck.decks.forEach(newDeck => {
        if(!ds.decksStore.decks.find(e=>e.id === newDeck.id)) ds.decksStore.decks.push(newDeck);
      });
      deck.models.forEach(newModel => {
        if(!ds.decksStore.models.find(e=>e.id === newModel.id)) ds.decksStore.models.push(newModel);
      });
      deck.notes.forEach(newNote => {
        if(!ds.decksStore.notes.find(e=>e.id === newNote.id)) ds.decksStore.notes.push(newNote);
      });

      console.log("inserting");
      console.log(ds);
      chrome.storage.local.set(ds);

      loadDeckEntries();
    });
}

function onDeckSelect(event){
  var element = event.target;
  console.log("click");
  selectDeck(element);
  updateSelectedDeck(element.id.split('.')[1]);
}

function selectDeck(element){
  Array.prototype.slice.call(decksList.children).forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
}

function updateSelectedDeck(id){
  selectedDeckId = id;
  chrome.storage.local.set({selected: selectedDeckId});
}

function loadSelectedDeck(){
  chrome.storage.local.get("selected", e => {
    if(e.selected) {
      selectedDeckId = e.selected;
      let selectedElem = document.getElementById("deck." + selectedDeckId);
      if(selectedElem) selectDeck(selectedElem);
    }
    if(!selectedDeckId){
      let child = decksList.firstElementChild;
      if(child){
        selectDeck(child);
        updateSelectedDeck(child.id.split('.')[1]);
      }
    }
  });
}

function updateOptions(){
  console.log("update options");
  if(this.value < 1) this.value = 1;
  chrome.storage.local.set({options: {cards: cardNumInput.value, time: timeInput.value}});
}

function loadOptions(){
  chrome.storage.local.get({options: {cards:3,time:5}},e=>{
    console.log("getting options");
    cardNumInput.value = e.options.cards;
    timeInput.value = e.options.time;
  });
}

function loadDeckEntries(){
  chrome.storage.local.get({decksStore:emptyDecksStore},e=>{
    console.log("getting deck entries");
    if(e.decksStore.decks.length){
      decksList.innerHTML = "";
      for(let deck of e.decksStore.decks){
        decksList.insertAdjacentHTML("beforeend", 
        `<li id="deck.${deck.id}">${deck.name}<i class="fa-pull-right fa fa-trash"></i></li>`);
        document.getElementById(`deck.${deck.id}`).addEventListener("click",onDeckSelect);
      }
    }
    loadSelectedDeck();
  });
}

