import type { PlasmoCSConfig } from "plasmo";


export const config: PlasmoCSConfig = {
  matches: ["*://*.ea.com/*", "*://*.easports.com/*"],
};

const style = document.createElement("style");
style.textContent = `
    .aviontrade-btn {
      display: inline-flex;
      align-items: center;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      background: green;
      font-family: UltimateTeam, sans-serif;
      color: white;
      margin-right: 8px;
    }
    .aviontrade-btn:hover {
      background: white;
      color: green;
    }
  `;
document.head.appendChild(style);

function saveTradepile(data: any) {
  console.log("[Aviontrade Content] Saving tradepile to storage:", data);
  chrome.storage.local.set({ tradepileData: data });
}

async function getSavedTradepile() {
  const result = await chrome.storage.local.get("tradepileData");
  return result.tradepileData;
}

async function sendTradepile() {
  const tradepile = await getSavedTradepile();
  console.log("[Aviontrade Content] Sending tradepile to background:", tradepile);
  if (tradepile) {
    console.log("[Aviontrade Content] Sending tradepile to background...");

    chrome.runtime.sendMessage(
      { type: "SEND_TRADEPILE", payload: tradepile },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[Aviontrade Content] Error:",
            chrome.runtime.lastError
          );
        } else {
          console.log("[Aviontrade Content] Response:", response);
        }
      }
    );
  } else {
    console.log("[Aviontrade Content] No tradepile data saved yet");
  }
}

function createCustomButton() {
  const btn = document.createElement("div");
  btn.className = "aviontrade-btn";
  btn.innerHTML = `<span class="aviontrade-text">Send tradepile</span>`;
  btn.addEventListener("click", sendTradepile);
  return btn;
}

function injectButton() {
  const header = document.querySelector(
    ".ut-transfer-list-view .ut-section-header-view"
  );
  if (header && !document.querySelector(".aviontrade-btn")) {
    header.appendChild(createCustomButton());
  }
}

const observer = new MutationObserver(() => {
  injectButton();
});

window.addEventListener("load", () => {
  observer.observe(document.body, { childList: true, subtree: true });
});

window.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "TRADEPILE_DATA" && payload) {
    console.log("[Aviontrade Content] Received tradepile data:", payload);
    saveTradepile(payload);

    // Forward to background script immediately
    console.log("[Aviontrade Content] Forwarding to background...");
    chrome.runtime.sendMessage(
      { type: "SEND_TRADEPILE", payload: payload },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[Aviontrade Content] Forward error:",
            chrome.runtime.lastError
          );
        } else {
          console.log("[Aviontrade Content] Forwarded successfully:", response);
        }
      }
    );
  }
});

console.log("[Aviontrade Content] Message listener active");
