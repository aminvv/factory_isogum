import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BasketService } from '../../basket/services/basket.service';
import { GuestBasketService } from './guest-basket.service';
import { BasketDiscountKind, BasketProduct, BasketResponse, BasketSummary, CartItem } from '../model/basket.model';
import { API_CONFIG } from '../../common/api/api.config';
import { HttpClient } from '@angular/common/http';

const EMPTY_SUMMARY: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0, avgDiscountPercent: 0 };

@Injectable({ providedIn: 'root' })
export class BasketStateService {
  private readonly drawerOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private summarySubject = new BehaviorSubject<BasketSummary>(EMPTY_SUMMARY);
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);

  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly drawerOpen$: Observable<boolean> = this.drawerOpenSubject.asObservable();
  summary$ = this.summarySubject.asObservable();

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
    console.log('[basket] refresh() | isLoggedIn =', this.isLoggedIn());
    if (this.isLoggedIn()) {
      this.refreshFromServer();
    } else {
      this.refreshGuestSummary();
    }
  }

  private refreshFromServer(): void {
    this.basketService.getBasket().subscribe({
      next: (res: BasketResponse) => {
        console.log('[basket] refreshFromServer response =', res);
        const items = (res.products || []).map((dto: BasketProduct) => this.mapBasketDtoToCartItem(dto));
        this.itemsSubject.next(items);
        this.summarySubject.next({
          itemsCount: items.length,
          totalPrice: res.totalPrice || 0,
          finalAmount: res.finalAmount || 0,
          avgDiscountPercent: res.avgDiscountPercent || 0,
        });
      },
      error: (err) => {
        console.error('[basket] refreshFromServer error =', err);
        this.summarySubject.next(EMPTY_SUMMARY);
        this.itemsSubject.next([]);
      },
    });
  }

  private refreshGuestSummary(): void {
    const items = this.guestBasketService.getCart();
    const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const finalAmount = items.reduce((sum, i) => sum + (i.finalPrice ?? i.price ?? 0) * i.quantity, 0);
    const avgDiscountPercent = totalPrice > 0 ? ((totalPrice - finalAmount) / totalPrice) * 100 : 0;


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
      avgDiscountPercent,
    });
  }

  reset(): void {
    this.summarySubject.next(EMPTY_SUMMARY);
    this.itemsSubject.next([]);
      if (!this.isLoggedIn()) {
    this.guestBasketService.clearCart(); 
  
  }
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
          avgDiscountPercent: res.avgDiscountPercent || 0,
        });
      }),
      catchError((err) => {
        console.error('[basket] fetchBasket error =', err);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false)),
    ) as unknown as Observable<CartItem[]>;
  }

  mapBasketDtoToCartItem(dto: BasketProduct): CartItem {
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
      price: Number(dto.originalPrice || dto.finalPrice || 0),
      discountType,
      discountValue,
      quantity: dto.quantity || 1,
    };
  }

  changeQuantity(itemId: number, delta: 1 | -1): void {
    const current = this.itemsSubject.value;
    const target = current.find((i) => i.id === itemId);
    if (!target) {
      console.warn('[basket] changeQuantity: item not found', itemId);
      return;
    }

    const nextQty = target.quantity + delta;
    const previousSnapshot = [...current];
    console.log('[basket] changeQuantity', { itemId, delta, nextQty });

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
      console.log('[basket] updateQuantityOnServer: guest path');
      this.guestBasketService.updateQuantity(itemId, quantity);
      this.refreshGuestSummary();
      return;
    }

    console.log('[basket] updateQuantityOnServer: PATCH /basket/update', { productId: itemId, quantity });
    this.http
      .patch(`${API_CONFIG.baseUrl}/basket/update`, { productId: itemId, quantity })
      .subscribe({
        next: (res) => {
          console.log('[basket] PATCH success =', res);
          this.refreshFromServer();
        },
        error: (err) => {
          console.error('[basket] PATCH error =', err);
          this.itemsSubject.next(rollbackSnapshot);
        },
      });
  }

  private removeItemOnServer(itemId: number, rollbackSnapshot: CartItem[]): void {
    if (!this.isLoggedIn()) {
      this.guestBasketService.removeFromCart(itemId);
      this.refreshGuestSummary();
      return;
    }
    this.http
      .delete(`${API_CONFIG.baseUrl}/removeFromBasketById/${itemId}`)
      .subscribe({
        next: () => this.refreshFromServer(),
        error: (err) => {
          console.error('[basket] DELETE error =', err);
          this.itemsSubject.next(rollbackSnapshot);
        },
      });
  }

  openDrawer(): void {
    this.drawerOpenSubject.next(true);
    this.refresh();
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

  getCurrentSummary(): BasketSummary {
    return this.summarySubject.value;
  }
}