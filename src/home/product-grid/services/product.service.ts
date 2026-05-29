import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { API_CONFIG } from "../../../common/api/api.config";

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  id: number;
  productCode: string;
  productName?: string;
  description?: string;
  price: number;
  rollWeight?: number;
  thickness?: number;
  dimensions?: string;
  lifespan?: string;
  bitumenType?: string;
  warranty?: string;
  image?: ProductImage[];
  quantity?: number;
  discountPercent?: number;
  discountAmount?: number;
  nationalProductCode?: string;
  fiberBaseType?: string;
  internationalCode?: string;
  brandRegistrationNumber?: string;
  coatingType?: string;
  productBenefits?: string;
  applicationType?: string;
  isogumType?: string;
  technicalSpecifications?: string;
}

export interface ProductResponse {
  products: Product[];
  pagination: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.product}`;

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1, limit: number = 6): Observable<ProductResponse> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<ProductResponse>(`${this.apiUrl}/list`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/get-product/${id}`);
  }
}