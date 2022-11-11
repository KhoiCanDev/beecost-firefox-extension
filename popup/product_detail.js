function loadCurrentTab(tabs) {
  const productUrl = tabs[0].url;
  if (productUrl) {
    const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${productUrl}`;
    fetch(`https://corsproxy.io/?${encodeURIComponent(urlSrc)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => loadProductPage(data));
  } else {
    setAsUnsupportedPage();
  }
}

function loadProductPage(product) {
  if (product.status === 'error') {
    setAsUnsupportedPage();
    setAsUnsupportedProductPage();
    return;
  }

  document.body.classList.add('have-content-body');
  const productId = product.data.product_base.product_base_id;
  const detailPageUrl = `https://beecost.vn/product-p.${productId}`;

  const productIframe = document.createElement('iframe');
  productIframe.setAttribute('src', detailPageUrl);
  productIframe.style.width = '748px';
  productIframe.style.height = '512px';
  productIframe.style.overflowX = 'none';
  productIframe.style.border = 'none';
  productIframe.style.transform = 'scale(0.8)';
  productIframe.style.transformOrigin = 'top left';
  productIframe.onload = (ev) => {
    document.getElementById('loading-page').classList.add('hidden');
  };
  document.getElementById('iframe-container').appendChild(productIframe);
}

function onError(error) {
  console.error(`Error: ${error}`);
}

function setAsUnsupportedPage() {
  document.getElementById('loading-page').classList.add('hidden');
  document.body.classList.add('no-content-body');
  document.getElementById('not-supported-page').classList.remove('hidden');
  document.getElementById('not-supported-page').classList.add('visible');
}

function setAsUnsupportedProductPage() {
  document.getElementById('not-supported-page').getElementsByTagName("p")[0].innerHTML = "Not supported product";
}

browser.tabs
  .query({ currentWindow: true, active: true })
  .then(loadCurrentTab, onError);
