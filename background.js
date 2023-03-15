function updateActiveTab() {
  function updateTab(tabs) {
    browser.action.setIcon({ path: 'icons/app-48-grayscale.png' });
    browser.action.setBadgeText({ text: '' });
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      const activeTabUrl = activeTab.url;
      if (
        activeTabUrl.startsWith('https://shopee.vn/') ||
        activeTabUrl.startsWith('https://tiki.vn/') ||
        activeTabUrl.startsWith('https://www.lazada.vn/')
      ) {
        browser.action.setIcon({ path: 'icons/app-48.png' });
      }

      if (activeTabUrl.startsWith('https://shopee.vn/')) {
        browser.action.setBadgeText({ text: 'SP' });
      }

      if (activeTabUrl.startsWith('https://tiki.vn/')) {
        browser.action.setBadgeText({ text: 'TK' });
      }

      if (activeTabUrl.startsWith('https://www.lazada.vn/')) {
        browser.action.setBadgeText({ text: 'LZ' });
      }
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

browser.action.onClicked.addListener((_) => {
  browser.permissions.request({
    origins: [
      "https://shopee.vn/*",
      "https://tiki.vn/*",
      "https://www.lazada.vn/*",
      "https://apiv3.beecost.vn/*"
    ]
  }).then((result) => {
    if (result) {
      browser.action.setPopup({
        popup: 'popup/product_detail.html',
      })
    }
  });
});

browser.runtime.onStartup.addListener(() => {
  browser.permissions.getAll().then((currentPermissions) => {
    if (currentPermissions.origins && currentPermissions.origins.length > 0) {
      browser.action.setPopup({
        popup: 'popup/product_detail.html',
      });
    }
  });
});