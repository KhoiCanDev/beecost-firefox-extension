export function findMedian(numbers: number[]): number {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middleIndex = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    // Array has even length, return average of middle elements
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2
  } else {
    // Array has odd length, return middle element
    return sorted[middleIndex]
  }
}

export function findMinMax(prices: number[]): {
  foundMinPrice: number
  foundMaxPrice: number
} {
  let foundMinPrice = prices[0]
  let foundMaxPrice = foundMinPrice
  for (let i = 1; i < prices.length; i++) {
    const price = prices[i]
    if (price > foundMaxPrice) {
      foundMaxPrice = price
    }
    if (price < foundMinPrice) {
      foundMinPrice = price
    }
  }
  return { foundMinPrice, foundMaxPrice }
}

export function findMin(prices: number[]): number {
  let foundMinPrice = prices[0]
  for (let i = 1; i < prices.length; i++) {
    const price = prices[i]
    if (price < foundMinPrice) {
      foundMinPrice = price
    }
  }
  return foundMinPrice
}
