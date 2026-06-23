import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { BasketService } from '../../basket/services/basket.service';
import { BasketStateService, } from '../../basket/services/basket-state.service';
import { GuestBasketService } from '../../basket/services/guest-basket.service';
import { Product, ProductDetailService } from '../../product-detail-page/services/product-detail.service';
import { GuestCartItem } from '../../basket/model/guest-basket.model';
import { AuthStateService, AuthStateSnapshot } from '../../auth/service/AuthStateSnapshot.service';
import { CartItem, BasketDiscountKind, BasketProduct, BasketSummary } from '../../basket/model/basket.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ---------- Cart ----------
  cartSummary: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0, avgDiscountPercent: 0 };
  dropdownItems: CartItem[] = [];
  isCartDropdownOpen = false;
  loadingItems = false;

  // ---------- Auth ----------
  authState: AuthStateSnapshot = { isLoggedIn: false, user: null };
  isAuthDropdownOpen = false;

  // ---------- Search ----------
  searchKeyword = '';
  searchResults: Product[] = [];
  isSearchDropdownOpen = false;
  searchLoading = false;
  private searchSubject = new Subject<string>();
  isMobile = false;

  constructor(
    private basketStateService: BasketStateService,
    private guestBasketService: GuestBasketService,
    private basketService: BasketService,
    private authStateService: AuthStateService,
    private productService: ProductDetailService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.checkIsMobile();

    this.basketStateService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => (this.cartSummary = summary));


    this.basketStateService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => (this.dropdownItems = items));

    this.authStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => (this.authState = state));

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword || keyword.trim().length < 2) {
            this.searchLoading = false;
            return of({ products: [] });
          }
          this.searchLoading = true;
          return this.productService.searchProducts(keyword).pipe(
            catchError(() => of({ products: [] })),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(res => {
        this.searchResults = res.products || [];
        this.searchLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  checkIsMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }



  goToProductDetail(item: CartItem): void {
  if (item.id) {
    this.router.navigate(['/productDetail', item.id]);
  } else if (item.slug) {
    this.router.navigate(['/product', item.slug]);
  }
}

  // ================= Search =================
  onSearchInput(): void {
    this.isSearchDropdownOpen = true;
    this.searchSubject.next(this.searchKeyword);
  }

  onSearchFocus(): void {
    if (this.searchKeyword.trim().length >= 2) {
      this.isSearchDropdownOpen = true;
    }
  }

  closeSearchDropdown(): void {
    this.isSearchDropdownOpen = false;
  }

  goToProduct(product: Product): void {
    this.closeSearchDropdown();
    this.searchKeyword = '';
    this.router.navigate(['/product', product.id]);
  }

  // ================= Cart =================
  private isLoggedIn(): boolean {
    return this.authStateService.isLoggedIn();
  }

  private mapBasketProductToCartItem(dto: BasketProduct): CartItem {
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
      id: dto.id,
      basketItemId:dto.basketItemId,
      slug: dto.slug,
      name: dto.title,
      image: dto.image,
      price: Number(dto.originalPrice),
      discountType,
      discountValue,
      quantity: dto.quantity,
      stock:dto.stock ||100000
    };
  }

  private loadDropdownItems(): void {
    this.loadingItems = true;

    if (this.isLoggedIn()) {
      this.basketService.getBasket().subscribe({
        next: res => {
          this.dropdownItems = (res.products || []).map(p => this.mapBasketProductToCartItem(p));
          console.log(this.dropdownItems);
          this.loadingItems = false;
        },
        error: () => {
          this.dropdownItems = [];
          this.loadingItems = false;
        },
      });
    } else {
      const guestItems: GuestCartItem[] = this.guestBasketService.getCart();
      this.dropdownItems = guestItems.map((i: any) => ({
        id: i.productId,
        basketItemId:i.basketItemId,
        slug: '',
        name: i.productName || '—',
        image: i.image,
        price: i.price || 0,
        discountType: i.discountType || null,
        discountValue: i.discountValue || 0,
        quantity: i.quantity,
        stock: i.stock ?? 100000,
        
      }));
      this.loadingItems = false;
    }
  }

  getItemNewPrice(item: CartItem): number {
    if (item.discountType === 'percent' && item.discountValue > 0) {
      const discount = Math.round(item.price * (item.discountValue / 100));
      return Math.max(item.price - discount, 0);
    }
    if (item.discountType === 'amount' && item.discountValue > 0) {
      return Math.max(item.price - item.discountValue, 0);
    }
    return item.price;
  }



  getItemLineTotal(item: CartItem): number {
    return this.getItemNewPrice(item) * item.quantity;
  }

  getItemOldLineTotal(item: CartItem): number {
    return item.price * item.quantity;
  }


  increaseItemQuantity(item: CartItem): void {
    this.basketStateService.changeQuantity(item.id, 1);
  }

  decreaseItemQuantity(item: CartItem): void {
    this.basketStateService.changeQuantity(item.id, -1);
  }





  onCartMouseEnter(): void {
    if (this.isMobile) return;
    this.isCartDropdownOpen = true;
    this.loadDropdownItems();
    this.basketStateService.refresh();
  }

  onCartMouseLeave(): void {
    if (this.isMobile) return;
    this.isCartDropdownOpen = false;
  }

  onCartIconClick(): void {
    if (!this.isMobile) return;
    this.isCartDropdownOpen = !this.isCartDropdownOpen;
    if (this.isCartDropdownOpen) {
      this.loadDropdownItems();
      this.basketStateService.refresh();
    }
  }


   goToBasket(){
    this.router.navigate(['/checkout'])
   }

  closeCartDropdown(): void {
    this.isCartDropdownOpen = false;
  }

  goToCheckout(): void {
    this.closeCartDropdown();
    if (this.isLoggedIn()) {
      this.router.navigate(['/checkout/address']);
    } else {
      this.router.navigate(['/signup']);
    }
  }

  // ================= Auth =================
  onAuthMouseEnter(): void {
    if (this.isMobile || !this.isLoggedIn()) return;
    this.isAuthDropdownOpen = true;
  }

  onAuthMouseLeave(): void {
    if (this.isMobile) return;
    this.isAuthDropdownOpen = false;
  }


  get isCheckoutPage(){
     return this.router.url.includes('/checkout')
  }

  onAuthIconClick(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/signup']);
      return;
    }
    if (this.isMobile) {
      this.isAuthDropdownOpen = !this.isAuthDropdownOpen;
    }
  }

  closeAuthDropdown(): void {
    this.isAuthDropdownOpen = false;
  }

  goTo(path: string): void {
    this.closeAuthDropdown();
    this.router.navigate([path]);
  }

  logout(): void {
    this.closeAuthDropdown();
    this.authStateService.logout();
    this.basketStateService.refresh();
  }
}