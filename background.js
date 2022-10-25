function updateActiveTab(tabs) {
  function updateTab(tabs) {
    const activeTab = tabs[0];
    if (activeTab.url) {
      if (activeTab.url.startsWith("https://shopee.vn/")) {
        browser.browserAction.setBadgeText({ text: "SP" });
      } else if (activeTab.url.startsWith("https://tiki.vn/")) {
        browser.browserAction.setBadgeText({ text: "TK" });
      } else if (activeTab.url.startsWith("https://www.lazada.vn/")) {
        browser.browserAction.setBadgeText({ text: "LZ" });
      }
    } else {
      browser.browserAction.setBadgeText({ text: "" });
    }
  }

  let gettingActiveTab = browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  gettingActiveTab.then(updateTab);
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);
