// ============================================================
// checkout/services/address.service.ts
// ============================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address, CreateAddressDto } from '../model/address.model';
import { API_CONFIG } from '../../../common/api/api.config';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}/address`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.baseUrl);
  }

  createAddress(dto: CreateAddressDto): Observable<Address> {
    const body = new HttpParams()
    const params = new URLSearchParams();
    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    return this.http.post<Address>(this.baseUrl, params.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    });
  }

  updateAddress(id: number, dto: Partial<CreateAddressDto>): Observable<Address> {
    const params = new URLSearchParams();
    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    return this.http.patch<Address>(`${this.baseUrl}/${id}`, params.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    });
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}