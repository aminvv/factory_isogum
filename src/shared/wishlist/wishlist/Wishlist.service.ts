import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../common/api/api.config';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = `${API_CONFIG.baseUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  add(productId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${productId}`, {}, { headers: this.headers });
  }

  remove(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`, { headers: this.headers });
  }

  check(productId: number): Observable<{ isWishlisted: boolean }> {
    return this.http.get<{ isWishlisted: boolean }>(`${this.baseUrl}/check/${productId}`, { headers: this.headers });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.headers });
  }
}
