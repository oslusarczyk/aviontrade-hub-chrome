(function () {
  console.log("[Aviontrade Inject] Starting injection...");

  const ORIGINAL_SEND = XMLHttpRequest.prototype.send;
  const ORIGINAL_OPEN = XMLHttpRequest.prototype.open;

  function isTradeRelatedUrl(url) {
    if (!url) return false;
    return String(url).includes("tradepile");
  }

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._url = String(url);
    return ORIGINAL_OPEN.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", () => {
      if (isTradeRelatedUrl(this._url)) {
        try {
          const data = JSON.parse(this.responseText);
          window.postMessage({ type: "TRADEPILE_DATA", payload: data }, "*");
        } catch (e) {
          console.error("[Aviontrade Inject] XHR error:", e);
        }
      }
    });
    
    return ORIGINAL_SEND.call(this, body);
  };

  console.log("[Aviontrade Inject] XHR interception active");
})();