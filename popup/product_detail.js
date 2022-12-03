function loadCurrentTab(tabs) {
  const productUrl = tabs[0].url;
  if (productUrl) {
    const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${productUrl}`;
    fetch(getCorsFreeUrl(urlSrc))
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
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

  document.body.classList.add('have-content-body');
  const productId = product.data.product_base.product_base_id;
  const productPrice = product.data.product_base.price;

  const priceHistoryApi = `https://apiv3.beecost.vn/product/history_price?product_base_id=${productId}&price_current=${productPrice}`;
  const priceHistoryResponse = await fetch(getCorsFreeUrl(priceHistoryApi));
  const priceHistoryJson = await priceHistoryResponse.json();

  const historyData = priceHistoryJson.data.product_history_data.item_history;
  const prices = historyData.price;
  const timestamps = historyData.price_ts;

  console.log('prices timestamps', prices, timestamps);
  
  document.getElementById('loading-page').classList.add('hidden');
  
  const chartElement = document.getElementById('iframe-container');
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

  console.log('data', data);

  var chart = LightweightCharts.createChart(chartElement, {
		width:600, 
    height: 400,
		layout: {
			textColor: '#d1d4dc',
			backgroundColor: '#000000',
		},
		rightPriceScale: {
			scaleMargins: {
				top: 0.3,
				bottom: 0.25,
			},
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
		grid: {
			vertLines: {
				color: 'rgba(42, 46, 57, 0)',
			},
			horzLines: {
				color: 'rgba(42, 46, 57, 0)',
			},
		},
		handleScroll: {
			vertTouchDrag: false,
		},
    localization: {
      priceFormatter: myPriceFormatter,
    },
	});
  
	var series = chart.addLineSeries({
		color: 'rgb(0, 120, 255)',
		lineWidth: 2,
		crosshairMarkerVisible: false,
		lastValueVisible: false,
		priceLineVisible: false,
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
		title: 'minimum price',
	};
	var currentPriceLine = {
		price: currentPrice,
		color: '#be1238',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: 'current price',
	};
	var maxPriceLine = {
		price: maximumPrice,
		color: '#be1238',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: 'maximum price',
	}

	series.createPriceLine(minPriceLine);
	series.createPriceLine(currentPriceLine);
	series.createPriceLine(maxPriceLine);

	chart.timeScale().fitContent();
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

function getCorsFreeUrl(url) {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

browser.tabs
  .query({ currentWindow: true, active: true })
  .then(loadCurrentTab, onError);
