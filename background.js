const DEFAULT_BACKEND_URL = "http://localhost:4000";

async function sendTradepileToBackend(tradeEvent) {
  
  try {
    const response = await fetch(`${DEFAULT_BACKEND_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tradeEvent)
    });
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Backend error: ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SEND_TRADEPILE" && message?.payload) {

    sendTradepileToBackend(message.payload)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true; 
  }
  
  sendResponse({ success: false, error: "Unknown message type" });
  return false;
});
