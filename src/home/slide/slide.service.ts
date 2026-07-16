import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../common/api/api.config';
import { SlideItem } from './model/slide.model';

@Injectable({ providedIn: 'root' })
export class SlidePublicService {
  private baseUrl = `${API_CONFIG.baseUrl}/slides`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SlideItem[]> {
    return this.http.get<SlideItem[]>(this.baseUrl);
  }
}