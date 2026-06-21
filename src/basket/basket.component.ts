import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BasketResponse, BasketSummary, CartItem } from './model/basket.model';
import { BasketService } from './services/basket.service';
import { BasketStateService } from './services/basket-state.service';
import { AuthStateService } from '../auth/service/AuthStateSnapshot.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit, OnDestroy {
  basketData: BasketResponse | null = null;
  loading = false;
  addProductForm: FormGroup;
  discountForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private subscription = new Subscription();

  // ---------- Cart dropdown-style state ----------
  dropdownItems: CartItem[] = [];
  isCartDropdownOpen = true; // این صفحه همیشه باز است، دراور کشویی نیست
  loadingItems = false;
  cartSummary: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0, avgDiscountPercent: 0 };

  constructor(
    private basketService: BasketService,
    private basketStateService: BasketStateService,
    private authStateService: AuthStateService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addProductForm = this.fb.group({
      productId: ['', [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.discountForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // ================= Form actions (قدیمی، فرم تست) =================
  addProduct(): void {
    if (this.addProductForm.invalid) return;
    this.loading = true;
    this.basketService.addToBasket(this.addProductForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('محصول با موفقیت به سبد خرید اضافه شد');
        this.addProductForm.reset({ productId: '', quantity: 1 });
        this.basketStateService.refresh();
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  applyDiscount(): void {
    if (this.discountForm.invalid) return;
    this.loading = true;
    this.basketService.addDiscount(this.discountForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('کد تخفیف با موفقیت اعمال شد');
        this.discountForm.reset();
        this.basketStateService.refresh();
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  removeDiscount(): void {
    const code = this.discountForm.get('code')?.value;
    if (!code) {
      this.errorMessage = 'لطفاً کد تخفیف را وارد کنید';
      return;
    }
    this.loading = true;
    this.basketService.removeDiscount({ code }).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('کد تخفیف با موفقیت حذف شد');
        this.discountForm.reset();
        this.basketStateService.refresh();
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    console.error(err);
    if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else if (err.message) {
      this.errorMessage = err.message;
    } else {
      this.errorMessage = 'خطایی رخ داد. لطفاً مجدد تلاش کنید.';
    }
    setTimeout(() => (this.errorMessage = null), 5000);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 3000);
  }

  // ================= Cart item helpers (همان منطق navbar) =================

}