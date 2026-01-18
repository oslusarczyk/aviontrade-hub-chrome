import { Storage } from "@plasmohq/storage";

const storage = new Storage();
const DEFAULT_BACKEND_URL =
  process.env.PLASMO_PUBLIC_BACKEND_URL || "http://localhost:3000/api/";

async function sendTradepileToBackend(tradeEvent: any) {
  try {
    // Get token from storage (set via Clerk auth in popup)
    const apiToken = await storage.get("apiToken");
    console.log(apiToken);
    const response = await fetch(DEFAULT_BACKEND_URL + '/send-tradepile', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify(tradeEvent),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Backend error: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function logSalesToBackend(salesData: any) {
  try {
    const apiToken = await storage.get("apiToken");
    const response = await fetch(DEFAULT_BACKEND_URL + '/log-sales', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify(salesData),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Backend error: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SEND_TRADEPILE" && message?.payload) {
    sendTradepileToBackend(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message?.type === "LOG_SALES" && message?.payload) {
    logSalesToBackend(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
