import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../common/api/api.config';
import { BestSellerProduct } from './model/best-seller.model';

@Injectable({ providedIn: 'root' })
export class BestSellerService {
  private baseUrl = `${API_CONFIG.baseUrl}/products/best-sellers`;

  constructor(private http: HttpClient) {}

  getBestSellers(limit: number = 4): Observable<BestSellerProduct[]> {
    return this.http.get<BestSellerProduct[]>(this.baseUrl, {
      params: { limit: limit.toString() },
    });
  }
}