import ky from 'ky';

export const apiClient = ky.extend({
  retry: {
    limit: 5,
    backoffLimit: 1000
  },
});

export const buildGetProductUrl = (productUrl: string) => `https://apiv3.beecost.vn/search/product?product_url=${encodeURIComponent(
  productUrl
)}`

export const buildGetProductPricesUrl = (productId: string, productPrice: number) => `https://apiv3.beecost.vn/product/history_price?product_base_id=${productId}&price_current=${productPrice}`
