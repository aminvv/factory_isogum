import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../common/api/api.config';

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutPage {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  stats: AboutStat[];
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  constructor(private http: HttpClient) {}

  get(): Observable<AboutPage> {
    return this.http.get<AboutPage>(`${API_CONFIG.baseUrl}/about`);
  }
}