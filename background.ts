export {}
 
const updateActiveTab = () => {
  function updateTab(tabs) {
    browser.action.setBadgeText({ text: '' });
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      const activeTabUrl = activeTab.url;
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