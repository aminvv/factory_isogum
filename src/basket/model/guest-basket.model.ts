export interface GuestCartItem {
  productId: number;
  quantity: number;
  productName?: string;
  price?: number;
  finalPrice?: number;
  image?: string;
  discountType?: 'percent' | 'amount' | null;
  discountValue?: number;
}