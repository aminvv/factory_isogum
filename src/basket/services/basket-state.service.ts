import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
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


  private quantityErrorSubject = new Subject<{ itemId: number; message: string } | null>();
  readonly quantityError$ = this.quantityErrorSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly drawerOpen$: Observable<boolean> = this.drawerOpenSubject.asObservable();
  summary$ = this.summarySubject.asObservable();



  private discountCodeSubject = new BehaviorSubject<string | null>(null);
  discountCode$ = this.discountCodeSubject.asObservable();



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

    const saved = localStorage.getItem('discountCode');
    if (saved) this.discountCodeSubject.next(saved);
  }



  setDiscountCode(code: string | null): void {
  this.discountCodeSubject.next(code);
  if (code) localStorage.setItem('discountCode', code);
  else localStorage.removeItem('discountCode');
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

    const totalPrice = items.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    );

    const finalAmount = items.reduce(
      (sum, i) => sum + (i.finalPrice ?? i.price ?? 0) * i.quantity,
      0
    );

    const avgDiscountPercent =
      totalPrice > 0
        ? ((totalPrice - finalAmount) / totalPrice) * 100
        : 0;


    const cartItems: CartItem[] = items.map((item: any) => ({
      id: item.productId,
      basketItemId: item.basketItemId || 0,
      slug: item.slug || '',
      name: item.productName || 'نام محصول',
      image: item.image || 'assets/default.jpg',
      price: item.price || 0,
      discountType: item.discountType || null,
      discountValue: item.discountValue || 0,
      quantity: item.quantity,
      stock: item.stock ?? 100000,
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
  this.clearDiscount();
  if (!this.isLoggedIn()) {
    this.guestBasketService.clearCart();
  }
}

clearDiscount(): void {
  this.discountCodeSubject.next(null);
  localStorage.removeItem('discountCode');
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

    const percent = dto.discountPercent != null
      ? Number(dto.discountPercent)
      : 0;

    const amount = dto.discountAmount != null
      ? Number(dto.discountAmount)
      : 0;


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
      basketItemId: dto.basketItemId || 0,
      slug: dto.slug || '',
      name: dto.title || 'نام محصول',
      image: dto.image || 'assets/default.jpg',
      price: Number(dto.originalPrice || dto.finalPrice || 0),
      discountType,
      discountValue,
      quantity: dto.quantity || 1,
      stock: dto.stock ?? 100000
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

    // بررسی موجودی برای افزایش
    if (delta === 1 && nextQty > (target.stock ?? 100000)) {
      this.quantityErrorSubject.next({
        itemId,
        message: `حداکثر ${target.stock} عدد موجود است`
      });
      return;
    }

    // به‌روزرسانی UI (خوش‌بینانه)
    let newItems: CartItem[];
    if (nextQty < 1) {
      newItems = current.filter((i) => i.id !== itemId);
    } else {
      newItems = current.map((i) =>
        i.id === itemId ? { ...i, quantity: nextQty } : i
      );
    }
    this.itemsSubject.next(newItems);

    // درخواست به سرور
    if (this.isLoggedIn()) {
      if (delta === 1) {
        this.basketService.addToBasket({ productId: itemId, quantity: 1 }).subscribe({
          next: () => this.refreshFromServer(),
          error: (err) => {
            console.error('addToBasket error', err);
            this.itemsSubject.next(previousSnapshot);
          }
        });
      } else {
        // کاهش: از متد removeFromBasket استفاده کن (با productId)
        this.basketService.removeFromBasket(itemId).subscribe({
          next: () => this.refreshFromServer(),
          error: (err) => {
            console.error('removeFromBasket error', err);
            this.itemsSubject.next(previousSnapshot);
          }
        });
      }
    } else {
      // حالت مهمان
      this.guestBasketService.updateQuantity(itemId, nextQty);
      this.refreshGuestSummary();
    }
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
      .delete(`${API_CONFIG.baseUrl}/basket/removeFromBasketById/${itemId}`)
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

  isUserLoggedIn(): boolean {
    return this.isLoggedIn();
  }
}