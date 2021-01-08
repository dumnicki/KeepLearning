var anki = require("./anki");
//var fs = require("fs");

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed");

    /*chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostEquals: "developer.chrome.com"}})],
            actions: [new chrome.declarativeContent.ShowPageAction()]           
        }])
    });*/
    anki.test();
    
});
/*
fs.readFile("Japanese_Basic_Hiragana.apkg", (err,f) => ankiRead(f));
var ankiRead = (f) => {
    console.log("hello");
    console.log(anki(f).getCards());
}
*/