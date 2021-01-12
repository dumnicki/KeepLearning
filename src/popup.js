document.getElementById("test-btn").addEventListener("click",displayCard);

function displayCard(){
    chrome.runtime.sendMessage("displayCard");
}