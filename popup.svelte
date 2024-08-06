<script lang="ts">
  import { fetch as crossFetch } from "cross-fetch"
  import { default as fetchr } from "fetch-retry"
  import type { IChartApi, SingleValueData } from "lightweight-charts"

  import { type PopupPrices, getDefaultPopupPrices } from "~model/popup-prices"
  import { PopupState } from "~model/popup-state"
  import { PriceStatus } from "~model/price-status"
  import { convertToChartData } from "~utils/chart"
  import { findMedian, findMin, findMinMax } from "~utils/math"
  import LoadingView from "~views/loading-view.svelte"
  import NoDataView from "~views/no-data-view.svelte"
  import PriceDataView from "~views/price-data-view.svelte"
  import RequestPermissionsView from "~views/request-permissions-view.svelte"

  const allowedHosts = ["shopee.vn", "tiki.vn", "www.lazada.vn"]
  const retryableFetch = fetchr(crossFetch)
  const fetchRetryOption = {
    retries: 5,
    retryDelay: 800,
    retryOn: [503, 504]
  }

  let currentTabUrl = ""
  let currentPopupState: PopupState = PopupState.Loading
  let popupProductName = ""
  let priceHistoryRecords = []
  let chartApi: IChartApi
  let lineSeriesData: SingleValueData[] = []
  let popupPrices: PopupPrices = getDefaultPopupPrices()
  let priceStatus = PriceStatus.NoChange

  const loadCurrentTab = (tabs) => {
    currentTabUrl = tabs[0].url
    loadCurrentProductUrl()
  }

  const onError = (error) => {
    console.error(`Error: ${error}`)
  }

  const loadCurrentProductUrl = async () => {
    const allowQuery =
      currentTabUrl &&
      allowedHosts.some((allowedHost) => currentTabUrl.includes(allowedHost))

    if (!allowQuery) {
      currentPopupState = PopupState.UnsupportedPage
      return
    }

    const currentPermissions = await browser.permissions.getAll()

    if (
      !currentPermissions.origins ||
      currentPermissions.origins.length === 0
    ) {
      currentPopupState = PopupState.NeedPermissions
      return
    }

    await loadProductData()
  }

  const loadProductData = async () => {
    const urlSrc = `https://apiv3.beecost.vn/search/product?product_url=${encodeURIComponent(
      currentTabUrl
    )}`
    const response = await retryableFetch(urlSrc, fetchRetryOption)

    if (!response.ok) {
      currentPopupState = PopupState.NoData
      return
    }

    var data = await response.json()
    loadProductPage(data)
  }

  const loadProductPage = async (product) => {
    if (product.status === "error") {
      currentPopupState = PopupState.NoData
      return
    }

    const {
      data: {
        product_base: {
          product_base_id: productId,
          price: productPrice,
          name: productName
        }
      }
    } = product

    if (!productName || !productPrice) {
      currentPopupState = PopupState.NoData
      return
    }

    const priceHistoryApi = `https://apiv3.beecost.vn/product/history_price?product_base_id=${productId}&price_current=${productPrice}`

    const priceHistoryResponse = await retryableFetch(
      priceHistoryApi,
      fetchRetryOption
    )
    const priceHistoryJson = await priceHistoryResponse.json()

    const {
      data: {
        product_history_data: {
          item_history: { price: prices, price_ts: timestamps }
        }
      }
    } = priceHistoryJson

    createChartElement(prices, timestamps, productPrice)

    const timePriceZip = timestamps.map((e, i) => [e, prices[i]])
    createLowestPricesTable(prices, timePriceZip, productPrice)

    popupProductName = productName
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
  <PriceDataView
    {popupProductName}
    {popupPrices}
    {priceStatus}
    {lineSeriesData}
    {priceHistoryRecords} />
{/if}

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
