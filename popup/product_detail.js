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
    const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${encodeURIComponent(productUrl)}`;
    fetch(urlSrc)
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
  const priceHistoryResponse = await fetch(priceHistoryApi);
  const priceHistoryJson = await priceHistoryResponse.json();

  const historyData = priceHistoryJson.data.product_history_data.item_history;
  const prices = historyData.price;
  const timestamps = historyData.price_ts;
  
  document.getElementById('loading-page').classList.add('hidden');
	document.getElementById('product-name').innerText = productName;

	document.getElementById('content-page').classList.remove('hidden');
  const chartElement = document.getElementById('chart-element');
  createChart(prices, timestamps, productPrice, chartElement);
	const lowestPriceTableElement = document.getElementById('lowest-price-table');

	var timePriceZip = timestamps.map((e, i) => [e, prices[i]]);
	createLowestPricesTable(timePriceZip, lowestPriceTableElement);
}

const currentLocale = window.navigator.languages[0];
const myPriceFormatter = Intl.NumberFormat('vi-VN').format;

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
		grid: {
			vertLines: {
				color: 'rgba(209, 213, 219, 0.8)',
			},
			horzLines: {
				color: 'rgba(209, 213, 219, 0.8)',
			},
		},
		crosshair: {
			vertLine: {
				width: 4,
				color: 'rgba(224, 227, 235, 0.1)',
				style: 0,
			},
			horzLine: {
				width: 4,
				color: 'rgba(224, 227, 235, 0.1)',
				style: 0,
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
			grid: {
				vertLines: {
					color: 'rgba(209, 213, 219, 0.1)',
				},
				horzLines: {
					color: 'rgba(209, 213, 219, 0.1)',
				},
			},
			timeScale: {
				borderColor: 'rgba(209, 213, 219, 0.4)'
			},
			rightPriceScale: {
				borderColor: 'rgba(209, 213, 219, 0.4)'
			}
		}
	}

  var chart = LightweightCharts.createChart(chartElement, chartOptions);
  
	var series = chart.addLineSeries({
		lineWidth: 2,
		color: darkMode ? '#21E22F' : '#17cb27',
		crosshairMarkerVisible: true,
		lastValueVisible: true,
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

	var lineWidth = 1;
	var minPriceLine = {
		price: minimumPrice,
		color: 'rgba(59, 130, 246, 0.4)',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dashed,
		axisLabelVisible: true,
		title: 'thấp nhất',
	};
	var maxPriceLine = {
		price: maximumPrice,
		color: 'rgba(168, 85, 247, 0.4)',
		lineWidth: lineWidth,
		lineStyle: LightweightCharts.LineStyle.Dashed,
		axisLabelVisible: true,
		title: 'cao nhất',
	}
	const numberFormatter = Intl.NumberFormat('vi-VN');
	document.getElementById('lowest-price').innerText = numberFormatter.format(minimumPrice) + "₫";
	document.getElementById('current-price').innerText = numberFormatter.format(currentPrice) + "₫";
	document.getElementById('highest-price').innerText = numberFormatter.format(maximumPrice) + "₫";

	series.createPriceLine(minPriceLine);
	series.createPriceLine(maxPriceLine);

	chart.timeScale().fitContent();
}

const createLowestPricesTable = (timePriceZip, tableElement) => {
	var minimumPrice = timePriceZip[0][1];
	var maximumPrice = minimumPrice;
	for(var i = 1; i < timePriceZip.length; i++) {
		var price = timePriceZip[i][1];
		if (price > maximumPrice) {
			maximumPrice = price;
		}
		if (price < minimumPrice) {
			minimumPrice = price;
		}
	}
	if (minimumPrice !== maximumPrice) {
		const minMaxDiff = maximumPrice - minimumPrice;
		let allowedOffset = minMaxDiff * 0.3;
		const toPrice = minimumPrice + allowedOffset;
	
		const datePriceMap = new Map();
		for(var i = 1; i < timePriceZip.length; i++) {
			var time = timePriceZip[i][0];
			var price = timePriceZip[i][1];
			if (price >= minimumPrice && price <= toPrice) {
				var date = new Date(time);
				const day = date.getDate().toString().padStart(2, '0');
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const year = date.getFullYear();
				const key = `${day}-${month}-${year}`;
				if (datePriceMap.has(key)) {
					const keyPrice = datePriceMap.get(key);
					if (price < keyPrice) {
						datePriceMap.set(key, price);
					}
				} else {
					datePriceMap.set(key, price);
				}
			}
		}
		
		if (datePriceMap.size > 0) {
			const numberFormatter = Intl.NumberFormat('vi-VN');
			const reversedMap = new Map(Array.from(datePriceMap).reverse());
			const tbodyRef = tableElement.getElementsByTagName('tbody')[0];
			let cnt = 0;
			for (const [date, price] of reversedMap) {
				if (cnt == 5) {
					break;
				}
				const newRow = tbodyRef.insertRow();
				const dateCell = newRow.insertCell();
				const dateText = document.createTextNode(date);
				dateCell.appendChild(dateText);
	
				const priceCell = newRow.insertCell();
				const priceText = document.createTextNode(numberFormatter.format(price) + "₫");
				priceCell.appendChild(priceText);
	
				dateCell.className = "border border-slate-400 dark:border-slate-200 p-2";
				priceCell.className = "border border-slate-400 dark:border-slate-200 p-2 custom-text-right";
				
				cnt += 1;
			}
		}
	} else {
		const tbodyRef = tableElement.getElementsByTagName('tbody')[0];
		const newRow = tbodyRef.insertRow();
		const newCell = newRow.insertCell();
		newCell.colSpan = 2;
		const newText = document.createTextNode("Không có dữ liệu");
		newCell.appendChild(newText);
		newCell.className = "border border-slate-400 dark:border-slate-200 p-2";
	}
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

browser.tabs
  .query({ currentWindow: true, active: true })
  .then(loadCurrentTab, onError);
