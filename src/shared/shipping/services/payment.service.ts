// ============================================================
// checkout/services/payment.service.ts
// ============================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../common/api/api.config';

export interface PaymentResponse {
  gateWayUrl?: string;      
  authority?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}/payment`;

  constructor(private http: HttpClient) {}

  createPayment(addressId: number): Observable<PaymentResponse> {
    const params = new URLSearchParams();
    params.set('address', String(addressId));
    return this.http.post<PaymentResponse>(this.baseUrl, params.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    });
  }
}