const {getDeck} = require("./anki");

document.getElementById("test-url").textContent = chrome.runtime.getURL("popup.html");

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
    console.log(deck);
}

