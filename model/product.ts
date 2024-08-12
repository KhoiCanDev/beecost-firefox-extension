export interface Product {
  product_base: ProductBase
}

export interface ProductBase {
  product_base_id: string,
  price: number,
  name: string
}