// src/app/modules/basket/services/basket.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AddDiscountDto, AddToBasketDto, BasketResponse } from '../model/basket.model';
import { API_CONFIG } from '../../common/api/api.config';






@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private basketSubject = new BehaviorSubject<BasketResponse | null>(null);
  public basket$ = this.basketSubject.asObservable();

  constructor(private http: HttpClient) {}

  // دریافت سبد خرید و به‌روزرسانی BehaviorSubject
  getBasket(): Observable<BasketResponse> {
    return this.http.get<BasketResponse>(`${API_CONFIG.baseUrl}/basket`).pipe(
      tap(basket => this.basketSubject.next(basket))
    );
  }






  addToBasket(dto: AddToBasketDto): Observable<any> {
  const body = new HttpParams()
    .set('productId', dto.productId.toString())
    .set('quantity', dto.quantity.toString());

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  return this.http.post(`${API_CONFIG.baseUrl}/basket/addToBasket`, body.toString(), { headers });
}



  // اعمال کد تخفیف به سبد خرید
  addDiscount(dto: AddDiscountDto): Observable<any> {
    return this.http.post(`${API_CONFIG.baseUrl}/add-discount`, dto).pipe(
      tap(() => this.refreshBasket())
    );
  }

removeFromBasket(productId: number): Observable<any> {
  return this.http.delete(`${API_CONFIG.baseUrl}/removeFromBasket`, { body: { productId } });
}
 
  // حذف کامل یک آیتم از سبد خرید با استفاده از id رکورد سبد
  removeFromBasketById(id: number): Observable<any> {
    return this.http.delete(`${API_CONFIG.baseUrl}/removeFromBasketById/${id}`).pipe(
      tap(() => this.refreshBasket())
    );
  }

  // حذف کد تخفیف از سبد خرید
  removeDiscount(dto: AddDiscountDto): Observable<any> {
    return this.http.delete(`${API_CONFIG.baseUrl}/removeDiscount-FromBasket`, { body: dto }).pipe(
      tap(() => this.refreshBasket())
    );
  }

  // عملیات کمکی: بارگذاری مجدد سبد خرید
  private refreshBasket(): void {
    this.getBasket().subscribe();
  }




updateQuantity(productId: number, quantity: number): Observable<any> {
  return this.http.patch(`${API_CONFIG.baseUrl}/basket/update`, { productId, quantity }).pipe(
    tap(() => this.refreshBasket())
  );
}










  

}