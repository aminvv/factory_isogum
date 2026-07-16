import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../common/api/api.config';
import { ProductSpotlightDetails } from './model/product-spotlight.model';

@Injectable({ providedIn: 'root' })
export class ProductSpotlightService {
  private baseUrl = `${API_CONFIG.baseUrl}/product-spotlight`;

  constructor(private http: HttpClient) {}

  getActive(): Observable<ProductSpotlightDetails> {
    return this.http.get<ProductSpotlightDetails>(this.baseUrl);
  }
}