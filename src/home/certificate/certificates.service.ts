import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from './model/certificate.model';
import { API_CONFIG } from '../../common/api/api.config';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private apiUrl = `${API_CONFIG.baseUrl}/certificates`;

  constructor(private http: HttpClient) {}

  getActiveCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.apiUrl);
  }
}