(function () {
  console.log("[Aviontrade Content] Content script loaded");

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

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
  (document.head || document.documentElement).appendChild(style);

  function saveTradepile(data) {
    chrome.storage.local.set({ tradepileData: data}, () => {
      console.log("[Aviontrade Content] Tradepile saved to storage");
    });
  }

  function getSavedTradepile() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["tradepileData"], (result) => {
        resolve(result.tradepileData || null);
      });
    });
  }

  async function sendTradepile() {
    const tradepile = await getSavedTradepile();
    if (tradepile) {
      console.log("[Aviontrade Content] Sending tradepile to background...");
      
      chrome.runtime.sendMessage(
        { type: "SEND_TRADEPILE", payload: tradepile },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("[Aviontrade Content] Error:", chrome.runtime.lastError);
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
    const header = document.querySelector("header.ut-section-header-view");
    const clearSoldBtn = header?.querySelector("button.btn-standard.section-header-btn");
    if (header && clearSoldBtn && !document.querySelector(".aviontrade-btn")) {
      header.insertBefore(createCustomButton(), clearSoldBtn);
      console.log("[Aviontrade Content] Custom button injected");
    }
  }

  injectButton();

  const observer = new MutationObserver(() => {
    injectButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });


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
            console.error("[Aviontrade Content] Forward error:", chrome.runtime.lastError);
          } else {
            console.log("[Aviontrade Content] Forwarded successfully:", response);
          }
        }
      );
    }
  });

  console.log("[Aviontrade Content] Message listener active");
})();