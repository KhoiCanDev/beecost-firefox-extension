import {
  ChartOptions,
  CreatePriceLineOptions,
  DeepPartial,
  LineSeriesPartialOptions,
  LineStyle,
  SingleValueData,
  UTCTimestamp
} from "lightweight-charts"

import { DEFAULT_PRICE_FORMATTER, isDarkModeSystem } from "./system"

export function getChartOptions(): DeepPartial<ChartOptions> {
  const isDarkMode = isDarkModeSystem()
  let chartOptions: DeepPartial<ChartOptions> = getDefaultChartOptions()
  if (isDarkMode) {
    chartOptions = getDarkModeChartOptions(chartOptions)
  }
  return chartOptions
}

export function getLineSeriesOptions(): LineSeriesPartialOptions {
  const isDarkMode = isDarkModeSystem()
  const lineSeriesOptions: LineSeriesPartialOptions = {
    lineWidth: 2,
    color: isDarkMode ? "#21E22F" : "#17cb27",
    crosshairMarkerVisible: true,
    lastValueVisible: true,
    priceLineVisible: false
  }
  return lineSeriesOptions
}

export function getHighestPriceLineOptions(): CreatePriceLineOptions {
  return {
    price: 0,
    color: "rgba(168, 85, 247, 0.4)",
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: true,
    title: "cao nhất"
  }
}

export function getLowestPriceLineOptions(): CreatePriceLineOptions {
  return {
    price: 0,
    color: "rgba(59, 130, 246, 0.4)",
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: true,
    title: "thấp nhất"
  }
}

export function convertToChartData(prices: number[], timestamps: number[]): SingleValueData[] {
  const data: SingleValueData[] = []
  for (let index = 0; index < prices.length; index++) {
    const price = prices[index]
    const timestamp = timestamps[index]
    const dataPoint = {
      time: (timestamp / 1000) as UTCTimestamp,
      value: price
    }
    data.push(dataPoint)
  }
  return data
}

function getDefaultChartOptions(): DeepPartial<ChartOptions> {
  let chartOptions: DeepPartial<ChartOptions> = {
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
      priceFormatter: DEFAULT_PRICE_FORMATTER
    }
  }

  return chartOptions
}

function getDarkModeChartOptions(
  defaultChartOptions: DeepPartial<ChartOptions>
): DeepPartial<ChartOptions> {
  let chartOptions: DeepPartial<ChartOptions> = {
    ...defaultChartOptions,
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

  return chartOptions
}
