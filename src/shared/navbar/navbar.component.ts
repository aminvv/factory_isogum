import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { BasketService } from '../../basket/services/basket.service';
import { BasketStateService, BasketSummary } from '../../basket/services/basket-state.service';
import { GuestBasketService } from '../../basket/services/guest-basket.service';
import { Product, ProductDetailService } from '../../product-detail-page/services/product-detail.service';
import { GuestCartItem } from '../../basket/model/guest-basket.model';
import { AuthStateService, AuthStateSnapshot } from '../../auth/service/AuthStateSnapshot.service';

interface CartDropdownItem {
  productId: number;
  title: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ---------- Cart ----------
  cartSummary: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0 };
  dropdownItems: CartDropdownItem[] = [];
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
  ) {}

  ngOnInit(): void {
    this.checkIsMobile();

    this.basketStateService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => (this.cartSummary = summary));

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

  private loadDropdownItems(): void {
    this.loadingItems = true;

    if (this.isLoggedIn()) {
      this.basketService.getBasket().subscribe({
        next: res => {
          this.dropdownItems = (res.products || []).map((p: any) => ({
            productId: p.id,
            title: p.title,
            quantity: p.quantity,
            price: p.price,
          }));
          this.loadingItems = false;
        },
        error: () => {
          this.dropdownItems = [];
          this.loadingItems = false;
        },
      });
    } else {
      const guestItems: GuestCartItem[] = this.guestBasketService.getCart();
      this.dropdownItems = guestItems.map(i => ({
        productId: i.productId,
        title: i.productName || '—',
        quantity: i.quantity,
        price: i.finalPrice ?? i.price ?? 0,
      }));
      this.loadingItems = false;
    }
  }

  onCartMouseEnter(): void {
    if (this.isMobile) return;
    this.isCartDropdownOpen = true;
    this.loadDropdownItems();
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
    }
  }

  closeCartDropdown(): void {
    this.isCartDropdownOpen = false;
  }

  goToCheckout(): void {
    this.closeCartDropdown();
    if (this.isLoggedIn()) {
      this.router.navigate(['/checkout/address']);
    } else {
      this.router.navigate(['/auth/login']);
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

  onAuthIconClick(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
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
