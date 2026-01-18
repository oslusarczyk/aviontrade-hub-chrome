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
    .aviontrade-btn-sales {
      background: #2563eb;
    }
  `;
document.head.appendChild(style);

function saveTradepile(data: any) {
  console.log("[Aviontrade Content] Saving tradepile to storage:", data);
  chrome.storage.local.set({ tradepileData: data.auctionInfo});
}

function saveClubData(data: any) {
  chrome.storage.local.set({ clubData: data.userInfo.personaId });
}

async function getSavedTradepileAuctionInfo() {
  const result = await chrome.storage.local.get("tradepileData");
  const data = result.tradepileData;
  return Array.isArray(data) ? data : undefined;

}

async function cachePurchasePrices(auctionInfo: any[]) {
  const result = await chrome.storage.local.get("purchasePriceCache");
  const cache = (result.purchasePriceCache as Record<number, number>) || {};
  for (const item of auctionInfo) {
    const itemId = item.itemData.id;
    if (!(itemId in cache) && item.itemData.lastSalePrice) {
      cache[itemId] = item.itemData.lastSalePrice;
    }
  }
  await chrome.storage.local.set({ purchasePriceCache: cache });
}

async function getMappingContext() {
  const [clubResult, cacheResult] = await Promise.all([
    chrome.storage.local.get("clubData"),
    chrome.storage.local.get("purchasePriceCache"),
  ]);
  
  return {
    personaId: clubResult.clubData,
    priceCache: (cacheResult.purchasePriceCache as Record<number, number>) || {},
  };
}

async function mapTradepileItems(auctionInfo: any[]) {
  const { personaId, priceCache } = await getMappingContext();

  return auctionInfo.map((item) => {
    const lastSalePrice = priceCache[item.itemData.id] ?? item.itemData.lastSalePrice;
    return {
      tradeId: item.tradeId,
      assetId: item.itemData.assetId,
      rating: item.itemData.rating,
      resourceId: item.itemData.resourceId,
      preferredPosition: item.itemData.preferredPosition,
      attributeArray: item.itemData.attributeArray,
      buyNowPrice: item.buyNowPrice,
      lastSalePrice: lastSalePrice,
      personaId: personaId,
    };
  });
}

async function mapSalesItems(auctionInfo: any[]) {
  const { personaId, priceCache } = await getMappingContext();
  return auctionInfo.map((item) => {
    const itemId = item.itemData.id;
    const cachedPrice = priceCache[itemId];
    const lastSalePrice = cachedPrice ?? item.itemData.lastSalePrice;
    const profitMade = lastSalePrice ? (item.buyNowPrice * 0.95 - lastSalePrice) : 0;
    return {
      tradeId: item.tradeId,
      resourceId: item.itemData.resourceId,
      buyNowPrice: item.buyNowPrice,
      lastSalePrice: lastSalePrice,
      profitMade: profitMade,
      personaId: personaId,
    };
  });
}
async function sendTradepile() {
  const auctionInfo = await getSavedTradepileAuctionInfo();
  if (auctionInfo) {
    const mappedItems = await mapTradepileItems(auctionInfo);
    console.log("[Aviontrade Content] Sending tradepile to background:", mappedItems);
    chrome.runtime.sendMessage(
      { type: "SEND_TRADEPILE", payload: mappedItems },
    );
  } else {
    console.log("[Aviontrade Content] No tradepile data saved yet");
  }
}

async function logSales() {
  const auctionInfo = await getSavedTradepileAuctionInfo();
  if (auctionInfo) {
    const soldItems = auctionInfo.filter((item: any) => item.tradeState === "closed");
    if (soldItems.length === 0) {
      console.log("[Aviontrade Content] No sold items to log");
      return;
    }
    const mappedSoldItems = await mapSalesItems(soldItems);
    chrome.runtime.sendMessage(
      { type: "LOG_SALES", payload: mappedSoldItems },
    );
  } else {
    console.log("[Aviontrade Content] No tradepile data saved yet");
  }
}

function createSendTradepileButton() {
  const btn = document.createElement("div");
  btn.className = "aviontrade-btn";
  btn.innerHTML = `<span class="aviontrade-text">Send tradepile</span>`;
  btn.addEventListener("click", sendTradepile);
  return btn;
}

function createLogSalesButton() {
  const btn = document.createElement("div");
  btn.className = "aviontrade-btn aviontrade-btn-sales";
  btn.innerHTML = `<span class="aviontrade-text">Log sales</span>`;
  btn.addEventListener("click", logSales);
  return btn;
}

function injectButtons() {
  const header = document.querySelector(
    ".ut-transfer-list-view .ut-section-header-view"
  );
  if (header && !document.querySelector(".aviontrade-btn")) {
    header.appendChild(createSendTradepileButton());
    header.appendChild(createLogSalesButton());
  }
}

const observer = new MutationObserver(() => {
  injectButtons();
});

window.addEventListener("load", () => {
  observer.observe(document.body, { childList: true, subtree: true });
});

window.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "TRADEPILE_DATA" && payload) {
    console.log("[Aviontrade Content] Received tradepile data:", payload);
    saveTradepile(payload);
    cachePurchasePrices(payload.auctionInfo);
  }

  if (type === "GET_CLUB_DATA" && payload) {
    console.log("[Aviontrade Content] Received club data:", payload);
    saveClubData(payload);
  }
});

console.log("[Aviontrade Content] Message listener active");
