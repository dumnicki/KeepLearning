
var options = {cards: 3, time: 5};
var selectedDeckId = 0;

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed");
    //chrome.storage.local.clear();
});

chrome.tabs.onActivated.addListener((info)=>{
    console.log("active " + info.tabId);
    chrome.tabs.get(info.tabId,(tab)=>{
        console.log(tab.url);
        /*
        if(tab.url.includes("translate.google")){
            console.log("translate");
            displayCard();
        } */
    })
});

chrome.tabs.onUpdated.addListener((tabId,changes,tab)=>{
    console.log("change in " + tabId);
});

loadDeck();

chrome.runtime.onStartup.addListener(()=>console.log("strtup ev"));
chrome.runtime.onSuspend.addListener(()=>console.log("suspended"));

chrome.storage.onChanged.addListener(detectStorageChange);

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    console.log("message recieved");
    if(message === "displayCard") displayCard();
    else console.log(message);
})

function detectStorageChange(changes){
    console.log("changes in storage");
    console.log(changes);
    if(changes.options && changes.options.newValue) options = changes.options.newValue;
    if(changes.selected && changes.selected.newValue){
        selectedDeckId = changes.selected.newValue;
        loadDeck();
    }
}

function loadDeck(){
    console.log("loading deck");
    chrome.storage.local.get("selected", e => {
        if(e.selected) selectedDeckId = e.selected;
        if(selectedDeckId) chrome.storage.local.get("decksStore", ds => {
            if(ds.decksStore) getSelectedDeck(ds.decksStore);
        })
    })
}

/**
 * @param {import('./anki').DecksStore} ds */
function getSelectedDeck(ds){
    var deck = ds.decks.find(e => e.id === selectedDeckId);
    var notes = ds.notes.filter(e => deck.cards.some(c => c.nid === e.id));
    var models = ds.models.filter(e => notes.some(n => n.mid === e.id));
    return {deck: deck, notes: notes, models: models};
}

function displayCard(){
    console.log("display");
    if(true){
        chrome.tabs.executeScript({file: "./inject.js"});
    }
    else alert('no deck selected');
}

