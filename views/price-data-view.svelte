<script lang="ts">
  import type {
    ChartOptions,
    DeepPartial,
    IChartApi,
    LineSeriesPartialOptions,
    SingleValueData
  } from "lightweight-charts"
  import { Chart, LineSeries, PriceLine } from "svelte-lightweight-charts"

  import PriceHistoryTable from "~components/price-history-table.svelte"
  import PriceStatusIcon from "~components/price-status-icon.svelte"
  import { type PopupPrices, getDefaultPopupPrices } from "~model/popup-prices"
  import { PriceStatus } from "~model/price-status"
  import {
    getChartOptions,
    getHighestPriceLineOptions,
    getLineSeriesOptions,
    getLowestPriceLineOptions
  } from "~utils/chart"
  import { DEFAULT_PRICE_FORMATTER } from "~utils/system"

  export let popupProductName = ""
  export let popupPrices: PopupPrices = getDefaultPopupPrices()
  export let priceStatus: PriceStatus = PriceStatus.NoChange
  export let lineSeriesData: SingleValueData[] = []
  export let priceHistoryRecords = []

  let chartApi: IChartApi
  let popupChartOptions: DeepPartial<ChartOptions>
  let lineSeriesOption: LineSeriesPartialOptions
  let lowestPriceLineOptions = getLowestPriceLineOptions()
  let highestPriceLineOptions = getHighestPriceLineOptions()

  const assignChartRefAndResize = (chartRef: IChartApi) => {
    chartApi = chartRef
    popupChartOptions = getChartOptions()
    lineSeriesOption = getLineSeriesOptions()
    chartApi?.timeScale()?.fitContent()
  }
</script>

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
          <PriceStatusIcon {priceStatus} />
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
            <PriceLine price={popupPrices.lowest} {...lowestPriceLineOptions} />
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
    <PriceHistoryTable {priceHistoryRecords} />

    <div class="flex justify-end mt-5">
      <div class="text-xs text-black dark:text-white">
        Dữ liệu cung cấp bởi <a
          class="text-yellow-600 cursor-pointer"
          href="https://muathongminh.vn"
          target="_blank">MuaThongMinh</a>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .w-have-content {
    width: 40rem;
  }
</style>
