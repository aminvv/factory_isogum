import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { API_CONFIG } from "../../common/api/api.config";

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductDetail {
  id: number;
  productId: number;
  key: string;
  value: string;
}

export interface Discount {
  id: number;
  code?: string | null;
  percent?: number;
  amount?: number;
  limit?: number;
  usage?: number;
  expires_in?: Date;
  productId?: number | null;
  type: string;
}

export interface Product {
  id: number;
  productCode: string;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  rating: number;
  active_discount: boolean;
  slug: string;
  discount: string | number;
  image?: { url: string; publicId: string }[];
  details?: { id: number; productId: number; key: string; value: string }[];
  bitumenType?: string;
  coatingType?: string;
  update_at: Date;
  lifespan?: string;
  weight?: string;
  thickness?: string;
  saleType?: string;
  deliveryTime?: string;
  deliveryCost?: string;
  returnable?: boolean;
  insurance?: boolean;
  discounts?: Discount[];
}

export interface ProductResponse {
  products: Product[];
  pagination: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDetailService {
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.product}`;

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1, limit: number = 6): Observable<ProductResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ProductResponse>(`${this.apiUrl}/list`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/get-product/${id}`);
  }

  getProductDiscounts(productId: number): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${API_CONFIG.baseUrl}/discount/get-discounts-by-product/${productId}`);
  }






}