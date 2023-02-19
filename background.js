function updateActiveTab(tabs) {
  function updateTab(tabs) {
    const activeTab = tabs[0];
    browser.action.setIcon({ path: 'icons/app-48.png' });
    if (activeTab.url) {
      if (activeTab.url.startsWith('https://shopee.vn/')) {
        browser.action.setBadgeText({ text: 'SP' });
      } else if (activeTab.url.startsWith('https://tiki.vn/')) {
        browser.action.setBadgeText({ text: 'TK' });
      } else if (activeTab.url.startsWith('https://www.lazada.vn/')) {
        browser.action.setBadgeText({ text: 'LZ' });
      }
    } else {
      browser.action.setIcon({ path: 'icons/app-48-grayscale.png' });
      browser.action.setBadgeText({ text: '' });
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
