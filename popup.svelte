<script lang="ts">
  import {
    ChartOptions,
    CreatePriceLineOptions,
    DeepPartial,
    LineSeriesPartialOptions,
    LineStyle,
    IChartApi,
  } from "lightweight-charts"
  import { FrownIcon, LoaderIcon } from "svelte-feather-icons"
  import { Chart, LineSeries, PriceLine } from "svelte-lightweight-charts"

  enum PopupState {
    Loading,
    UnsupportedPage,
    NoData,
    HaveData
  }

  const allowed_hosts = ["shopee.vn", "tiki.vn", "www.lazada.vn"]
  const myPriceFormatter = Intl.NumberFormat("vi-VN").format
  let currentPopupState: PopupState = PopupState.Loading
  let popupProductName = ""
  let priceHistoryRecords = []
  let chartApi: IChartApi;
  let popupChartOptions: DeepPartial<ChartOptions>
  let lineSeriesData = []
  let lineSeriesOption: LineSeriesPartialOptions
  let lowestPrice = ""
  let currentPrice = ""
  let highestPrice = ""
  let lowestPriceLineOptions: CreatePriceLineOptions
  let highestPriceLineOptions: CreatePriceLineOptions

  const loadCurrentTab = (tabs) => {
    const productUrl = tabs[0].url

    let allowQuery = false
    for (const allowed_host of allowed_hosts) {
      if (productUrl && productUrl.includes(allowed_host)) {
        allowQuery = true
        break
      }
    }

    if (productUrl && allowQuery) {
      const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${encodeURIComponent(
        productUrl
      )}`
      fetch(urlSrc)
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            currentPopupState = PopupState.NoData
          }
        })
        .then((data) => loadProductPage(data))
    } else {
      currentPopupState = PopupState.UnsupportedPage
    }
  }

  const loadProductPage = async (product) => {
    if (product.status === "error") {
      currentPopupState = PopupState.NoData
      return
    }

    const productId = product.data.product_base.product_base_id
    const productPrice = product.data.product_base.price
    const productName = product.data.product_base.name

    const priceHistoryApi = `https://apiv3.beecost.vn/product/history_price?product_base_id=${productId}&price_current=${productPrice}`
    const priceHistoryResponse = await fetch(priceHistoryApi)
    const priceHistoryJson = await priceHistoryResponse.json()

    const historyData = priceHistoryJson.data.product_history_data.item_history
    const prices = historyData.price
    const timestamps = historyData.price_ts

    popupProductName = productName

    createChartElement(prices, timestamps, productPrice)

    const timePriceZip = timestamps.map((e, i) => [e, prices[i]])
    createLowestPricesTable(timePriceZip)

    currentPopupState = PopupState.HaveData
  }

  const createChartElement = (prices, timestamps, productPrice) => {
    const data = []
    const datapointCnt = prices.length

    for (let index = 0; index < datapointCnt; index++) {
      const price = prices[index]
      const timestamp = timestamps[index]
      const dataPoint = {
        time: timestamp / 1000,
        value: price
      }
      data.push(dataPoint)
    }

    lineSeriesData = data


    let minimumPrice = data[0].value
    let maximumPrice = minimumPrice
    for (let i = 1; i < data.length; i++) {
      const price = data[i].value
      if (price > maximumPrice) {
        maximumPrice = price
      }
      if (price < minimumPrice) {
        minimumPrice = price
      }
    }

    lowestPriceLineOptions = {
      price: minimumPrice,
      color: "rgba(59, 130, 246, 0.4)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "thấp nhất"
    }
    highestPriceLineOptions = {
      price: maximumPrice,
      color: "rgba(168, 85, 247, 0.4)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "cao nhất"
    }
    const numberFormatter = Intl.NumberFormat("vi-VN")
    lowestPrice = numberFormatter.format(minimumPrice) + "₫"
    currentPrice = numberFormatter.format(productPrice) + "₫"
    highestPrice = numberFormatter.format(maximumPrice) + "₫"
  }

  const createLowestPricesTable = (timePriceZip) => {
    let minimumPrice = timePriceZip[0][1]
    let maximumPrice = minimumPrice
    for (let i = 1; i < timePriceZip.length; i++) {
      const price = timePriceZip[i][1]
      if (price > maximumPrice) {
        maximumPrice = price
      }
      if (price < minimumPrice) {
        minimumPrice = price
      }
    }
    if (minimumPrice !== maximumPrice) {
      const minMaxDiff = maximumPrice - minimumPrice
      let allowedOffset = minMaxDiff * 0.3
      const toPrice = minimumPrice + allowedOffset

      const datePriceMap = new Map()
      for (let i = 1; i < timePriceZip.length; i++) {
        const time = timePriceZip[i][0]
        const price = timePriceZip[i][1]
        if (price >= minimumPrice && price <= toPrice) {
          const date = new Date(time)
          const day = date.getDate().toString().padStart(2, "0")
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const year = date.getFullYear()
          const key = `${day}-${month}-${year}`
          if (datePriceMap.has(key)) {
            const keyPrice = datePriceMap.get(key)
            if (price < keyPrice) {
              datePriceMap.set(key, price)
            }
          } else {
            datePriceMap.set(key, price)
          }
        }
      }

      if (datePriceMap.size > 0) {
        const reversedMap = new Map(Array.from(datePriceMap).reverse())
        let cnt = 0
        for (const [date, price] of reversedMap) {
          if (cnt == 5) {
            break
          }
          priceHistoryRecords.push({
            date,
            price
          })
          cnt += 1
        }
      }
    }
  }

  const onError = (error) => {
    console.error(`Error: ${error}`)
  }

  const assignChartRefAndResize = (chartRef: IChartApi) => {
    chartApi = chartRef;

    let chartOptions: DeepPartial<ChartOptions> = {
      width: 400,
      height: 600,
      layout: {
        background: { color: "#FFFFFF" },
        textColor: "#191919"
      },
      grid: {
        vertLines: {
          color: "rgba(209, 213, 219, 0.8)"
        },
        horzLines: {
          color: "rgba(209, 213, 219, 0.8)"
        }
      },
      crosshair: {
        vertLine: {
          width: 4,
          color: "rgba(224, 227, 235, 0.1)",
          style: 0
        },
        horzLine: {
          width: 4,
          color: "rgba(224, 227, 235, 0.1)",
          style: 0,
          visible: true,
          labelVisible: true
        }
      },
      handleScroll: {
        vertTouchDrag: false
      },
      localization: {
        locale: "vi-VN",
        priceFormatter: myPriceFormatter
      }
    }
    let darkMode = false
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      darkMode = true
      chartOptions = {
        ...chartOptions,
        layout: {
          background: { color: "#2B2B43" },
          textColor: "#D9D9D9"
        },
        grid: {
          vertLines: {
            color: "rgba(209, 213, 219, 0.1)"
          },
          horzLines: {
            color: "rgba(209, 213, 219, 0.1)"
          }
        },
        timeScale: {
          borderColor: "rgba(209, 213, 219, 0.4)"
        },
        rightPriceScale: {
          borderColor: "rgba(209, 213, 219, 0.4)"
        }
      }
    }

    popupChartOptions = chartOptions

    lineSeriesOption = {
      lineWidth: 2,
      color: darkMode ? "#21E22F" : "#17cb27",
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    }

    chartApi?.timeScale()?.fitContent();
  }

  browser.tabs
    .query({ currentWindow: true, active: true })
    .then(loadCurrentTab, onError)
</script>

{#if currentPopupState === PopupState.Loading}
  <div
    class="bg-white dark:bg-gray-800 shadow-md rounded-lg max-w-lg w-64 h-80">
    <div class="flex flex-col items-center justify-center w-full h-full">
      <div>
        <LoaderIcon
          class="loading-spin-animation text-black dark:text-white h-32 w-32" />
      </div>
      <p class="p-4 font-sans text-lg text-black dark:text-white text-center">
        Đang tải dữ liệu...
      </p>
    </div>
  </div>
{:else if currentPopupState === PopupState.UnsupportedPage || currentPopupState === PopupState.NoData}
  <div
    class="bg-white dark:bg-gray-800 shadow-md rounded-lg max-w-lg w-64 h-80">
    <div class="flex flex-col items-center justify-center w-full h-full">
      <div>
        <FrownIcon class="text-black dark:text-white h-32 w-32" />
      </div>
      <p class="p-4 font-sans text-lg text-black dark:text-white text-center">
        {#if currentPopupState === PopupState.UnsupportedPage}
          Không hỗ trợ trang này
        {:else}
          Không có dữ liệu cho sản phẩm này
        {/if}
      </p>
    </div>
  </div>
{:else}
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg w-content">
    <div class="px-5 py-5">
      <p class="text-gray-900 dark:text-white font-semibold text-xl truncate">
        {popupProductName}
      </p>
      <div class="pt-5 flex items-center justify-between gap-2">
        <div class="flex flex-col">
          <div class="text-3xl font-bold text-blue-500 dark:text-blue-300">
            {lowestPrice}
          </div>
          <div
            class="text-sm text-blue-800 dark:text-blue-300 dark:text-opacity-60 text-opacity-40">
            Thấp nhất
          </div>
        </div>
        <div class="flex flex-col">
          <div
            class="text-3xl font-bold text-malachite-500 dark:text-malachite-300">
            {currentPrice}
          </div>
          <div
            class="text-sm text-malachite-800 dark:text-malachite-300 dark:text-opacity-60 text-opacity-40">
            Hiện tại
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-3xl font-bold text-purple-500 dark:text-purple-300">
            {highestPrice}
          </div>
          <div
            class="text-sm text-purple-800 dark:text-purple-300 dark:text-opacity-60 text-opacity-40">
            Cao nhất
          </div>
        </div>
      </div>
      <div
        class="flex justify-center content-center mt-2 border border-slate-400 dark:border-slate-200"
        id="chart-container">
        <div class="w-full h-96" id="chart-element">
          <Chart {...popupChartOptions} ref={(ref) => assignChartRefAndResize(ref)}>
            <LineSeries data={lineSeriesData} {...lineSeriesOption}>
              <PriceLine {...lowestPriceLineOptions} />
              <PriceLine {...highestPriceLineOptions} />
            </LineSeries>
          </Chart>
        </div>
      </div>
      <div class="mt-5 text-md font-semibold text-blue-800 dark:text-blue-300">
        Các thời điểm thấp nhất gần đây
      </div>
      <table
        class="mt-2 w-full table-auto border-collapse border border-slate-400 text-slate-800 dark:border-slate-200 dark:text-slate-100"
        id="lowest-price-table">
        <thead>
          <tr>
            <th
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-2"
              >Ngày</th>
            <th
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-2 text-right"
              >Giá</th>
          </tr>
        </thead>
        <tbody>
          {#if priceHistoryRecords.length > 0}
            {#each priceHistoryRecords as priceHistoryRecord}
              <tr>
                <td class="border border-slate-400 dark:border-slate-200 p-2"
                  >{priceHistoryRecord.date}</td>
                <td
                  class="border border-slate-400 dark:border-slate-200 p-2 text-right"
                  >{priceHistoryRecord.price}</td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td
                class="border border-slate-400 dark:border-slate-200 p-2"
                colSpan="2">Không có dữ liệu</td>
            </tr>
          {/if}
        </tbody>
      </table>
      <div class="flex justify-end mt-5">
        <div class="text-xs text-black dark:text-white">
          Powered by <a
            class="text-yellow-600 cursor-pointer"
            href="https://beecost.vn/"
            target="_blank">BeeCost</a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .loading-spin-animation {
    animation: spin 4s infinite linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
