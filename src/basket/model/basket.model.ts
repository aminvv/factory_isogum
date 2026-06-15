
export interface AddToBasketDto {
  productId: number;
  quantity: number;
}

export interface AddDiscountDto {
  code: string;
}

export interface BasketProduct {
  id: number;
  slug: string;
  title: string;
  discount: number | string; 
  price: number;
  quantity: number;
}

export interface BasketDiscount {
  percent?: number;
  amount?: number;
  code: string;
  type: 'product' | 'Basket';
  productId?: number | null;
}

export interface BasketResponse {
  totalPrice: number;
  finalAmount: number;
  totalDiscountAmount: number;
  products: BasketProduct[];
  discounts: BasketDiscount[];
  productDiscounts: any[]; 
}