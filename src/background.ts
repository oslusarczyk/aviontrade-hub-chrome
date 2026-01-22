import { createClerkClient } from "@clerk/chrome-extension/background";

const DEFAULT_BACKEND_URL =
  process.env.PLASMO_PUBLIC_BACKEND_URL || "http://localhost:3000/api/";

const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";

async function syncToken() {
  try {
    const clerk = await createClerkClient({
      publishableKey: PUBLISHABLE_KEY,
    });

    if (clerk.session) {
      const token = await clerk.session.getToken();
      console.log("token:",token);
      if (token) {
        await chrome.storage.local.set({ apiToken: token });
        console.log("Token synced in background");
      }
    } else {
      await chrome.storage.local.remove("apiToken");
      console.log("No session, token removed");
    }
  } catch (err) {
    console.error("Failed to sync token in background", err);
  }
}

syncToken();


  async function getApiToken() {
    const apiToken = await chrome.storage.local.get("apiToken");
    return apiToken.apiToken;
  }

async function sendTradepileToBackend(tradeEvent: any) {
  try {
    const apiToken = await getApiToken();
    console.log("token tradepile reqqquest:",apiToken);
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

  if (message?.type === "LOG_SALES" && message?.payload) {
    logSalesToBackend(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
