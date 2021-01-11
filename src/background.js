
var options = {cards: 3, time: 5};
var selectedDeckId = 0;
var currentDeck = {deck: null, notes: [], models: []};

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed");
    chrome.storage.local.clear();
    /*chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostEquals: "developer.chrome.com"}})],
            actions: [new chrome.declarativeContent.ShowPageAction()]           
        }])
    });*/
    
});

chrome.storage.onChanged.addListener(detectStorageChange);

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
    currentDeck = {deck: deck, notes: notes, models: models};
}
