import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../common/api/api.config';
import { Product } from '../../../product-detail-page/services/product-detail.service';

@Injectable({ providedIn: 'root' })
export class RelatedProductsService {
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.product}`;

  constructor(private http: HttpClient) { }

  getRelatedProducts(productId: number, limit: number = 4): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ relatedProducts: Product[] }>(`${this.apiUrl}/${productId}/related`, { params })
      .pipe(map(res => res.relatedProducts.map(p => {
        // تخفیف بدون کد
        const noCodeDiscount = p.discounts?.find(d => !d.code)

        if (!noCodeDiscount) return { ...p, hasDiscount: false, finalPrice: p.price }

        if (noCodeDiscount.percent) {
          return {
            ...p,
            hasDiscount: true,
            discountPercent: noCodeDiscount.percent,
            finalPrice: p.price - (p.price * noCodeDiscount.percent / 100)
          }
        } else {
          return {
            ...p,
            hasDiscount: true,
            discountAmount: noCodeDiscount.amount,
            finalPrice: p.price - (noCodeDiscount.amount ?? 0)
          }
        }})));
  }
}