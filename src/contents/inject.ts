import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["*://*.ea.com/*", "*://*.easports.com/*"],
  world: "MAIN",
};

declare global {
  interface XMLHttpRequest {
    _url?: string;
  }
}

const ORIGINAL_SEND = XMLHttpRequest.prototype.send;
const ORIGINAL_OPEN = XMLHttpRequest.prototype.open;

function isTradeRelatedUrl(url: string) {
  if (!url) return false;
  return String(url).includes("tradepile");
}

XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  ...rest: any[]
) {
  this._url = String(url);
  return ORIGINAL_OPEN.apply(this, [method, url, ...rest] as any);
};

XMLHttpRequest.prototype.send = function (body) {
  this.addEventListener("load", () => {
    if (this._url && isTradeRelatedUrl(this._url)) {
      try {
        const data = JSON.parse(this.responseText);
        window.postMessage({ type: "TRADEPILE_DATA", payload: data }, "*");
      } catch (e) {
        console.error("[Aviontrade Inject] XHR error:", e);
      }
    }

    if (this._url && this._url.includes("usermassinfo")) {
      try {
        const data = JSON.parse(this.responseText);
        window.postMessage({ type: "GET_CLUB_DATA", payload: data }, "*");
      } catch (e) {
        console.error("[Aviontrade Inject] XHR error:", e);
      }
    }
  });

  return ORIGINAL_SEND.call(this, body);
};

console.log("[Aviontrade Inject] XHR interception active");
