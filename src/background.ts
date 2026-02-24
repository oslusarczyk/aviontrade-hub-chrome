import { createClerkClient } from "@clerk/chrome-extension/background";
import { Storage } from "@plasmohq/storage";
const storage = new Storage();

const DEFAULT_BACKEND_URL =
  process.env.PLASMO_PUBLIC_BACKEND_URL || "http://localhost:3000/api";

const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";

// const sendAlert = await storage.get("sendAlert") as boolean;

interface UserInfo {
  apiToken?: string;
}


async function syncToken() {
  try {
    const clerk = await createClerkClient({
      publishableKey: PUBLISHABLE_KEY,
    });

    if (clerk.session) {
      const token = await clerk.session.getToken();
      if (token) {
        await chrome.storage.local.set({userInfo: {apiToken: token }});
      }
    } else {
      await chrome.storage.local.remove("userInfo");
    }
  } catch (err) {
    console.error("Failed to sync token in background", err);
  }
}

async function showAlert(message: string) {
  const sendAlert = (await storage.get("sendAlert")) as boolean ?? false;
  
  if (!sendAlert) {
    return;
  }

  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { 
      type: "SHOW_NOTIFICATION", 
      payload: { message} 
    }).catch(() => {});
  }
}


syncToken();
setInterval(syncToken, 2000);


  async function getApiToken() {
    const userInfoResult = await chrome.storage.local.get("userInfo");
    const userInfo = userInfoResult.userInfo as UserInfo;
    return userInfo.apiToken;
  }
  

async function sendTradepileToBackend(tradeEvent: any) {
  try {
    const apiToken = await getApiToken();
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
  console.log("[Aviontrade Background] Logging sales to backend:", salesData);
  try {
     const apiToken = await getApiToken();    
     const response = await fetch(DEFAULT_BACKEND_URL + '/log-sales', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify(salesData),
    });

    if (response.ok) {
      await showAlert("Sales logged successfully!");
    } else {
      const res = await response.json();
      await showAlert(`Error: ${res.error}`);
    }
  } catch (error: any) {
    await showAlert(`Error: ${error.message}`);
  }
}

async function sendClubDataToBackend(clubData: any) {
  try {
    const apiToken = await getApiToken();
    const response = await fetch(DEFAULT_BACKEND_URL + '/add-club', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify(clubData),
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
  if (message?.type === "SYNC_TOKEN") {
    syncToken();
    return false;
  }
  if (message?.type === "SEND_TRADEPILE" && message?.payload) {
    sendTradepileToBackend(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message?.type === "SEND_CLUB_DATA" && message?.payload) {
    sendClubDataToBackend(message.payload)
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
