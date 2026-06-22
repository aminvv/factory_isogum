


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
  originalPrice: number;
  discountPercent: string | number | null;
  discountAmount: string | number | null;
  finalPrice: number;
  quantity: number;
  image?: string; 
  stock?: number
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
  avgDiscountPercent: number;
  products: BasketProduct[];
  discounts: BasketDiscount[];
  productDiscounts: any[];
}


export interface CartItem {
  id: number;
  slug: string;
  name: string;
  image: string | undefined;
  price: number;
  discountType: BasketDiscountKind;
  discountValue: number;
  quantity: number;
  stock: number;
}



export interface ItemPricing {
  oldPrice: number;
  newPrice: number;
  discountAmount: number; 
  hasDiscount: boolean;
  lineOldTotal: number;
  lineNewTotal: number;
  lineDiscountTotal: number;
}



export interface CartTotals {
  oldTotal: number;
  newTotal: number;
  discountTotal: number;
  avgDiscountPercent: number;
  hasAnyDiscount: boolean;
}



export interface BasketSummary {
  itemsCount: number;
  totalPrice: number;
  finalAmount: number;
  avgDiscountPercent: number; 
}


export type BasketDiscountKind = 'percent' | 'amount' | null;