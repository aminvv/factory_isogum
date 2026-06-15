// src/app/modules/basket/components/basket/basket.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BasketService } from './services/basket.service';
import { BasketResponse } from './model/basket.model';

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

  constructor(
    private basketService: BasketService,
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
    this.loadBasket();
    // اشتراک‌گذاری برای به‌روزرسانی خودکار
    this.subscription.add(
      this.basketService.basket$.subscribe(data => {
        this.basketData = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadBasket(): void {
    this.loading = true;
    this.basketService.getBasket().subscribe({
      next: () => {
        this.loading = false;
        this.clearMessages();
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  addProduct(): void {
    if (this.addProductForm.invalid) return;
    this.loading = true;
    this.basketService.addToBasket(this.addProductForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('محصول با موفقیت به سبد خرید اضافه شد');
        this.addProductForm.reset({ productId: '', quantity: 1 });
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
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  removeItem(productId: number): void {
    this.loading = true;
    this.basketService.removeFromBasket(productId).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('یک عدد از محصول کاهش یافت');
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  removeItemById(basketItemId: number): void {
    this.loading = true;
    this.basketService.removeFromBasketById(basketItemId).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('آیتم از سبد خرید حذف شد');
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

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}