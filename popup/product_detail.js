const allowed_hosts = [
	"shopee.vn",
	"tiki.vn",
	"www.lazada.vn"
];

function loadCurrentTab(tabs) {
	feather.replace();
  const productUrl = tabs[0].url;

	let allowQuery = false;
	for (const allowed_host of allowed_hosts) {
		if (productUrl && productUrl.includes(allowed_host)) {
			allowQuery = true;
			break;
		}
	}

  if (productUrl && allowQuery) {
    const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${productUrl}`;
    fetch(getCorsFreeUrl(urlSrc))
      .then((response) => {
        if (response.ok) {
					return response.json();
				} else {
					setAsUnsupportedPage();
					setAsUnsupportedProductPage();
				}
      })
      .then((data) => loadProductPage(data));
  } else {
    setAsUnsupportedPage();
  }
}

const loadProductPage = async (product) => {
  if (product.status === 'error') {
    setAsUnsupportedPage();
    setAsUnsupportedProductPage();
    return;
  }

  const productId = product.data.product_base.product_base_id;
  const productPrice = product.data.product_base.price;
	const productName = product.data.product_base.name;

  const priceHistoryApi = `https://apiv3.beecost.vn/product/history_price?product_base_id=${productId}&price_current=${productPrice}`;
  const priceHistoryResponse = await fetch(getCorsFreeUrl(priceHistoryApi));
  const priceHistoryJson = await priceHistoryResponse.json();

  const historyData = priceHistoryJson.data.product_history_data.item_history;
  const prices = historyData.price;
  const timestamps = historyData.price_ts;
  
  document.getElementById('loading-page').classList.add('hidden');
	document.getElementById('product-name').innerText = productName;

	document.getElementById('content-page').classList.remove('hidden');
  const chartElement = document.getElementById('chart-element');
  createChart(prices, timestamps, productPrice, chartElement);
}

const currentLocale = window.navigator.languages[0];
const myPriceFormatter = Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: 'VND',
}).format;

const createChart = (prices, timestamps, currentPrice, chartElement) => {
  var data = [];
  const datapointCnt = prices.length;

  for (let index = 0; index < datapointCnt; index++) {
    const price = prices[index];
    const timestamp = timestamps[index];
    const dataPoint = {
      time: timestamp / 1000,
      value: price
    };
    data.push(dataPoint);
  }

	let chartOptions = {
		layout: {
			background: { color: '#FFFFFF' },
			textColor: '#191919',
		},
		crosshair: {
			vertLine: {
				width: 4,
				color: 'rgba(224, 227, 235, 0.1)',
				style: 0,
			},
			horzLine: {
				visible: true,
				labelVisible: true,
			},
		},
		handleScroll: {
			vertTouchDrag: false,
		},
    localization: {
      locale: 'vi-VN',
      priceFormatter: myPriceFormatter,
    },
	};
	let darkMode = false;
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		darkMode = true;
		chartOptions = {
			...chartOptions,
			layout: {
				background: { color: '#2B2B43' },
				textColor: '#D9D9D9',
			},
		}
	}

  var chart = LightweightCharts.createChart(chartElement, chartOptions);
  
	var series = chart.addLineSeries({
		lineWidth: 2,
		color: darkMode ? '#21E22F' : '#2196F3',
		crosshairMarkerVisible: true,
		lastValueVisible: true,
		priceLineVisible: true,
	});
  series.setData(data);

	var minimumPrice = data[0].value;
	var maximumPrice = minimumPrice;
	for(var i = 1; i < data.length; i++) {
		var price = data[i].value;
		if (price > maximumPrice) {
			maximumPrice = price;
		}
		if (price < minimumPrice) {
			minimumPrice = price;
		}
	}

	var lineWidth = 2;
	var minPriceLine = {
		price: minimumPrice,
		color: '#be1238',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: 'thấp nhất',
	};
	var maxPriceLine = {
		price: maximumPrice,
		color: '#be1238',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: 'cao nhất',
	}
	const numberFormatter = Intl.NumberFormat('vi-VN');
	document.getElementById('lowest-price').innerText = "₫" + numberFormatter.format(minimumPrice);
	document.getElementById('current-price').innerText = "₫" + numberFormatter.format(currentPrice);
	document.getElementById('highest-price').innerText = "₫" + numberFormatter.format(maximumPrice);

	series.createPriceLine(minPriceLine);
	series.createPriceLine(maxPriceLine);

	chart.timeScale().fitContent();
}

function onError(error) {
  console.error(`Error: ${error}`);
}

function setAsUnsupportedPage() {
  document.getElementById('loading-page').classList.add('hidden');
  document.getElementById('not-supported-page').classList.remove('hidden');
  document.getElementById('not-supported-page').classList.add('visible');
}

function setAsUnsupportedProductPage() {
  document.getElementById('not-supported-page').getElementsByTagName("p")[0].innerHTML = "Không có dữ liệu cho sản phẩm này";
}

function getCorsFreeUrl(url) {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

browser.tabs
  .query({ currentWindow: true, active: true })
  .then(loadCurrentTab, onError);
