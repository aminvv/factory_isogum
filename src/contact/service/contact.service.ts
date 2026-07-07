import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../common/api/api.config';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactPage {
  id?: number;
  address: string;
  phone: string;
  mobile: string;
  email: string;
  workHours: string;
  mapLat: number;
  mapLng: number;
  socialLinks: SocialLink[];
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: HttpClient) {}

  get(): Observable<ContactPage> {
    return this.http.get<ContactPage>(`${API_CONFIG.baseUrl}/contact`); 
  }
}