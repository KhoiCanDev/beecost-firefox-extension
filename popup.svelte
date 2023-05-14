<script lang="ts">
  import type {
    ChartOptions,
    DeepPartial,
    IChartApi,
    LineSeriesPartialOptions,
    SingleValueData
  } from "lightweight-charts"
  import {
    ArrowDownRightIcon,
    ArrowRightIcon,
    ArrowUpRightIcon
  } from "svelte-feather-icons"
  import { Chart, LineSeries, PriceLine } from "svelte-lightweight-charts"

  import LoadingView from "~components/loading-view.svelte"
  import NoDataView from "~components/no-data-view.svelte"
  import RequestPermissionsView from "~components/request-permissions-view.svelte"
  import { type PopupPrices, getDefaultPopupPrices } from "~model/popup-prices"
  import { PopupState } from "~model/popup-state"
  import { PriceStatus } from "~model/price-status"
  import {
    convertToChartData,
    getChartOptions,
    getHighestPriceLineOptions,
    getLineSeriesOptions,
    getLowestPriceLineOptions
  } from "~util/chart"
  import { findMedian, findMin, findMinMax } from "~util/math"
  import { DEFAULT_PRICE_FORMATTER } from "~util/system"

  const allowedHosts = ["shopee.vn", "tiki.vn", "www.lazada.vn"]
  let currentTabUrl = ""
  let currentPopupState: PopupState = PopupState.Loading
  let popupProductName = ""
  let priceHistoryRecords = []
  let chartApi: IChartApi
  let popupChartOptions: DeepPartial<ChartOptions>
  let lineSeriesData: SingleValueData[] = []
  let lineSeriesOption: LineSeriesPartialOptions
  let popupPrices: PopupPrices = getDefaultPopupPrices()
  let lowestPriceLineOptions = getLowestPriceLineOptions()
  let highestPriceLineOptions = getHighestPriceLineOptions()
  let priceStatus = PriceStatus.NoChange

  const loadCurrentTab = (tabs) => {
    currentTabUrl = tabs[0].url
    loadCurrentProductUrl()
  }

  const loadCurrentProductUrl = () => {
    let allowQuery = false
    for (const allowed_host of allowedHosts) {
      if (currentTabUrl && currentTabUrl.includes(allowed_host)) {
        allowQuery = true
        break
      }
    }

    if (currentTabUrl && allowQuery) {
      browser.permissions.getAll().then((currentPermissions) => {
        if (
          !currentPermissions.origins ||
          currentPermissions.origins.length === 0
        ) {
          currentPopupState = PopupState.NeedPermissions
        } else {
          const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${encodeURIComponent(
            currentTabUrl
          )}`
          fetch(urlSrc)
            .then((response) => {
              if (response.ok) {
                return response.json()
              } else {
                currentPopupState = PopupState.NoData
              }
            })
            .then((data) => {
              loadProductPage(data)
            })
        }
      })
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
    createLowestPricesTable(prices, timePriceZip, productPrice)

    currentPopupState = PopupState.HaveData
  }

  const createChartElement = (
    prices: number[],
    timestamps: number[],
    productPrice: number
  ) => {
    lineSeriesData = convertToChartData(prices, timestamps)

    const { foundMinPrice, foundMaxPrice } = findMinMax(prices)
    popupPrices.lowest = foundMinPrice
    popupPrices.current = productPrice
    popupPrices.highest = foundMaxPrice

    chartApi?.timeScale()?.fitContent()
  }

  const createLowestPricesTable = (prices, timePriceZip, currentPrice) => {
    let minimumPrice = findMin(prices)
    let medianPrice = findMedian(prices)

    if (minimumPrice !== medianPrice) {
      const minMedianDiff = medianPrice - minimumPrice
      let allowedOffset = minMedianDiff * 0.3
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
        const currentDate = new Date()
        let cnt = 0
        for (const [date, price] of reversedMap) {
          if (cnt == 5) {
            break
          }
          const splittedDateParts = date.split("-")

          const saleDate = new Date(
            Number(splittedDateParts[2]),
            Number(splittedDateParts[1] - 1),
            Number(splittedDateParts[0])
          )
          const difference = currentDate.getTime() - saleDate.getTime()
          const daysAgo = Math.ceil(difference / (1000 * 3600 * 24))
          const discounted = Math.ceil(
            ((currentPrice - price) / currentPrice) * 100
          )

          priceHistoryRecords.push({
            daysAgo,
            date,
            price,
            discounted
          })
          cnt += 1
        }
      }
    }

    if (currentPrice > medianPrice) {
      priceStatus = PriceStatus.NowHigh
    } else if (currentPrice < medianPrice) {
      priceStatus = PriceStatus.NowLow
    }
  }

  const handlePermissionsResult = (event) => {
    const allowedState: boolean = event.detail.state
    if (allowedState) {
      loadCurrentProductUrl()
    }
  }

  const onError = (error) => {
    console.error(`Error: ${error}`)
  }

  const assignChartRefAndResize = (chartRef: IChartApi) => {
    chartApi = chartRef
    popupChartOptions = getChartOptions()
    lineSeriesOption = getLineSeriesOptions()
    chartApi?.timeScale()?.fitContent()
  }

  browser.tabs
    .query({ currentWindow: true, active: true })
    .then(loadCurrentTab, onError)
</script>

{#if currentPopupState === PopupState.Loading}
  <LoadingView />
{:else if currentPopupState === PopupState.NeedPermissions}
  <RequestPermissionsView on:permissionsResult={handlePermissionsResult} />
{:else if currentPopupState === PopupState.UnsupportedPage || currentPopupState === PopupState.NoData}
  <NoDataView popupState={currentPopupState} />
{:else}
  <div
    class="bg-white dark:bg-gray-800 shadow-md rounded-lg w-have-content overflow-y-auto">
    <div class="px-5 py-5">
      <p class="text-gray-900 dark:text-white font-semibold text-xl truncate">
        {popupProductName}
      </p>
      <div class="pt-5 flex items-center justify-between gap-2">
        <div class="flex flex-col">
          <div class="text-3xl font-bold text-blue-500 dark:text-blue-300">
            {DEFAULT_PRICE_FORMATTER(popupPrices.lowest)}₫
          </div>
          <div
            class="text-sm text-blue-800 dark:text-blue-300 dark:text-opacity-60 text-opacity-40">
            Thấp nhất
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row items-end">
            <div
              class="text-3xl font-bold text-malachite-500 dark:text-malachite-300 mr-1">
              {DEFAULT_PRICE_FORMATTER(popupPrices.current)}₫
            </div>
            {#if priceStatus === PriceStatus.NowHigh}
              <ArrowUpRightIcon class="text-red-400  h-6 w-6" />
            {:else if priceStatus === PriceStatus.NowLow}
              <ArrowDownRightIcon class="text-green-400 h-6 w-6" />
            {:else}
              <ArrowRightIcon class="text-yellow-400 h-6 w-6" />
            {/if}
          </div>
          <div
            class="text-sm text-malachite-800 dark:text-malachite-300 dark:text-opacity-60 text-opacity-40">
            Hiện tại
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-3xl font-bold text-purple-500 dark:text-purple-300">
            {DEFAULT_PRICE_FORMATTER(popupPrices.highest)}₫
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
        <div class="w-full h-72">
          <Chart
            autoSize={true}
            container={{ class: "w-full h-72" }}
            {...popupChartOptions}
            ref={(ref) => assignChartRefAndResize(ref)}>
            <LineSeries data={lineSeriesData} {...lineSeriesOption}>
              <PriceLine
                price={popupPrices.lowest}
                {...lowestPriceLineOptions} />
              <PriceLine
                price={popupPrices.highest}
                {...highestPriceLineOptions} />
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
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-left"
              >Ngày</th>
            <th
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-left"
              >Cách đây</th>
            <th
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-right"
              >Giá</th>
            <th
              class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-right"
              >Giảm</th>
          </tr>
        </thead>
        <tbody>
          {#if priceHistoryRecords.length > 0}
            {#each priceHistoryRecords as priceHistoryRecord}
              <tr>
                <td class="border border-slate-400 dark:border-slate-200 p-1"
                  >{priceHistoryRecord.date}</td>
                <td class="border border-slate-400 dark:border-slate-200 p-1"
                  >{priceHistoryRecord.daysAgo} ngày</td>
                <td
                  class="border border-slate-400 dark:border-slate-200 p-1 text-right"
                  >{DEFAULT_PRICE_FORMATTER(priceHistoryRecord.price)}₫</td>
                <td
                  class="border border-slate-400 dark:border-slate-200 p-1 text-right"
                  >{priceHistoryRecord.discounted}%</td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td
                class="border border-slate-400 dark:border-slate-200 p-2"
                colSpan="4">Không có dữ liệu</td>
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

  .w-have-content {
    width: 40rem;
  }
</style>
