export interface ProductPrices {
  product_history_data: ProductHistoryData
}

export interface ProductHistoryData {
  item_history: ItemHistory
}

export interface ItemHistory {
  price: number[],
  price_ts: number[],
}
