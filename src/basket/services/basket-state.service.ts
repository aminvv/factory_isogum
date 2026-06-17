import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BasketService } from '../../basket/services/basket.service';
import { GuestBasketService } from './guest-basket.service';
import { BasketDiscountKind, BasketProduct, BasketResponse, CartItem } from '../model/basket.model';
import { API_CONFIG } from '../../common/api/api.config';
import { HttpClient } from '@angular/common/http';

export interface BasketSummary {
  itemsCount: number;
  totalPrice: number;
  finalAmount: number;
}

const EMPTY_SUMMARY: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0 };

@Injectable({ providedIn: 'root' })
export class BasketStateService {
  private readonly drawerOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private summarySubject = new BehaviorSubject<BasketSummary>(EMPTY_SUMMARY);
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly drawerOpen$: Observable<boolean> = this.drawerOpenSubject.asObservable();
  summary$ = this.summarySubject.asObservable();

  // ✅ getter عمومی برای دسترسی به آیتم‌ها
  get items$(): Observable<CartItem[]> {
    return this.itemsSubject.asObservable();
  }

  constructor(
    private readonly http: HttpClient,
    private basketService: BasketService,
    private guestBasketService: GuestBasketService,
  ) {
    this.guestBasketService.cart$.subscribe(() => {
      if (!this.isLoggedIn()) {
        this.refreshGuestSummary();
      }
    });
    this.refresh();
  }

  private isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  refresh(): void {
    if (this.isLoggedIn()) {
      this.refreshFromServer();
    } else {
      this.refreshGuestSummary();
    }
  }

  private refreshFromServer(): void {
    this.basketService.getBasket().pipe(
      tap((res: BasketResponse) => {
        // ✅ تبدیل محصولات به CartItem
        const items = (res.products || []).map((dto: BasketProduct) => this.mapBasketDtoToCartItem(dto));
        this.itemsSubject.next(items);
        
        this.summarySubject.next({
          itemsCount: items.length,
          totalPrice: res.totalPrice || 0,
          finalAmount: res.finalAmount || 0,
        });
      }),
    ).subscribe({
      error: () => {
        this.summarySubject.next(EMPTY_SUMMARY);
        this.itemsSubject.next([]);
      },
    });
  }

  private refreshGuestSummary(): void {
    const items = this.guestBasketService.getCart();
    const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const finalAmount = items.reduce((sum, i) => sum + (i.finalPrice ?? i.price ?? 0) * i.quantity, 0);

    // ✅ تبدیل به CartItem برای نمایش در دراپ‌داون
    const cartItems: CartItem[] = items.map((item: any) => ({
      id: item.productId,
      slug: item.slug || '',
      name: item.productName || 'نام محصول',
      image: item.image || 'assets/default.jpg',
      price: item.price || 0,
      discountType: item.discountType || null,
      discountValue: item.discountValue || 0,
      quantity: item.quantity,
    }));
    this.itemsSubject.next(cartItems);

    this.summarySubject.next({
      itemsCount: items.length,
      totalPrice,
      finalAmount,
    });
  }

  reset(): void {
    this.summarySubject.next(EMPTY_SUMMARY);
    this.itemsSubject.next([]);
  }

  fetchBasket(): Observable<CartItem[]> {
    this.loadingSubject.next(true);
    return this.http.get<BasketResponse>(`${API_CONFIG.baseUrl}/basket`).pipe(
      tap((res: BasketResponse) => {
        const items = (res.products || []).map((dto: BasketProduct) => this.mapBasketDtoToCartItem(dto));
        this.itemsSubject.next(items);
        this.summarySubject.next({
          itemsCount: items.length,
          totalPrice: res.totalPrice || 0,
          finalAmount: res.finalAmount || 0,
        });
      }),
      catchError((err) => {
        console.error('خطا در واکشی سبد خرید', err);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false)),
    ) as unknown as Observable<CartItem[]>;
  }

  mapBasketDtoToCartItem(dto: BasketProduct): CartItem {
    // ✅ جلوگیری از undefined با مقدار پیش‌فرض
    const percent = dto.discountPercent != null ? Number(dto.discountPercent) : 0;
    const amount = dto.discountAmount != null ? Number(dto.discountAmount) : 0;

    let discountType: BasketDiscountKind = null;
    let discountValue = 0;

    if (percent > 0) {
      discountType = 'percent';
      discountValue = percent;
    } else if (amount > 0) {
      discountType = 'amount';
      discountValue = amount;
    }

    return {
      id: dto.id || 0,
      slug: dto.slug || '',
      name: dto.title || 'نام محصول',
      image: dto.image || 'assets/default.jpg',
      price: Number(dto.originalPrice || dto.finalPrice|| 0),
      discountType,
      discountValue,
      quantity: dto.quantity || 1,
    };
  }

  changeQuantity(itemId: number, delta: 1 | -1): void {
    const current = this.itemsSubject.value;
    const target = current.find((i) => i.id === itemId);
    if (!target) return;

    const nextQty = target.quantity + delta;
    const previousSnapshot = [...current];

    if (nextQty < 1) {
      this.itemsSubject.next(current.filter((i) => i.id !== itemId));
      this.removeItemOnServer(itemId, previousSnapshot);
      return;
    }

    const updated = current.map((i) =>
      i.id === itemId ? { ...i, quantity: nextQty } : i,
    );
    this.itemsSubject.next(updated);
    this.updateQuantityOnServer(itemId, nextQty, previousSnapshot);
  }

  private updateQuantityOnServer(
    itemId: number,
    quantity: number,
    rollbackSnapshot: CartItem[],
  ): void {
    if (!this.isLoggedIn()) {
      this.guestBasketService.updateQuantity(itemId, quantity);
      this.refreshGuestSummary();
      return;
    }
    this.http
      .patch(`${API_CONFIG.baseUrl}/basket/${itemId}`, { quantity })
      .pipe(
        catchError((err) => {
          console.error('خطا در بروزرسانی تعداد', err);
          this.itemsSubject.next(rollbackSnapshot);
          return of(null);
        }),
      )
      .subscribe();
  }

  private removeItemOnServer(itemId: number, rollbackSnapshot: CartItem[]): void {
    if (!this.isLoggedIn()) {
      this.guestBasketService.removeFromCart(itemId);
      this.refreshGuestSummary();
      return;
    }
    this.http
      .delete(`${API_CONFIG.baseUrl}/basket/${itemId}`)
      .pipe(
        catchError((err) => {
          console.error('خطا در حذف آیتم', err);
          this.itemsSubject.next(rollbackSnapshot);
          return of(null);
        }),
      )
      .subscribe();
  }

  openDrawer(): void {
    this.drawerOpenSubject.next(true);
    this.fetchBasket().subscribe();
  }

  closeDrawer(): void {
    this.drawerOpenSubject.next(false);
  }

  toggleDrawer(): void {
    this.drawerOpenSubject.value ? this.closeDrawer() : this.openDrawer();
  }

  get currentItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  // ✅ متد برای دسترسی به خلاصه فعلی (برای محاسبه میانگین تخفیف در کامپوننت)
  getCurrentSummary(): BasketSummary {
    return this.summarySubject.value;
  }
}