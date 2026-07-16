export interface BestSellerProduct {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  slug: string;
  image?: { url: string; publicId: string }[];
  totalSold: number;
}