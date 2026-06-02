// product-detail-page/product-comment/services/comment.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductComment } from '../model/comment.model';
import { API_CONFIG } from '../../../common/api/api.config';

export interface CommentResponse {
  pagination: any;
  comments: ProductComment[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private baseUrl = `${API_CONFIG.baseUrl}/product-comment`;

  constructor(private http: HttpClient) {}

  // دریافت نظرات
  getComments(productId: number, page: number = 1, limit: number = 10): Observable<CommentResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<CommentResponse>(`${this.baseUrl}/product/${productId}`, { params });
  }

addComment(comment: { text: string; productId: number; parentId?: number }): Observable<any> {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const headers: any = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return this.http.post(`${this.baseUrl}/`, comment, { headers });
}

  // حذف نظر
  deleteComment(commentId: number): Observable<any> {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.http.delete(`${this.baseUrl}/delete/${commentId}`, { headers });
  }
}