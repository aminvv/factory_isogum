// ============================================================
// checkout/shipping/shipping.component.ts
// ============================================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasketStateService } from '../../basket/services/basket-state.service';
import { BasketService } from '../../basket/services/basket.service';
import { CartItem, BasketSummary } from '../../basket/model/basket.model';
import { Address } from './model/address.model';
import { AddressService } from './services/address.service';
import { PaymentService } from './services/payment.service';
import { AddressStateService } from './services/address-state.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css'],
})
export class ShippingComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  // --- سبد خرید ---
  cartItems: CartItem[] = [];
  cartSummary: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0, avgDiscountPercent: 0 };

  // --- آدرس‌ها ---
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  showAddressForm = false;
  editingAddress: Address | null = null;
  addressLoading = false;
  addressError = '';

  // --- پرداخت ---
  paymentLoading = false;
  paymentError = '';

  // --- فرم آدرس ---
  addressForm!: FormGroup;

  // --- کد تخفیف ---
  discountForm: FormGroup;
  discountLoading = false;
  discountError: string | null = null;
  discountSuccess: string | null = null;
  appliedDiscountCode: string | null = null;

  quantityErrors: { [itemId: number]: string } = {};

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private paymentService: PaymentService,
    private basketService: BasketService,
    private basketStateService: BasketStateService,
    private addressStateService: AddressStateService,
    private router: Router,
  ) {
    this.discountForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildForm();

    this.sub.add(
      this.basketStateService.items$.subscribe(items => (this.cartItems = items))
    );
    this.sub.add(
      this.basketStateService.summary$.subscribe(s => (this.cartSummary = s))
    );


    this.basketStateService.quantityError$.subscribe(err => {
      if (err) {
        this.quantityErrors = { ...this.quantityErrors, [err.itemId]: err.message };
        setTimeout(() => {
          const updated = { ...this.quantityErrors };
          delete updated[err.itemId];
          this.quantityErrors = updated;
        }, 1000);
      }
    });

    this.loadAddresses();

  this.sub.add(
    this.basketStateService.discountCode$.subscribe(code => {
      this.appliedDiscountCode = code;
    })
  );


  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private buildForm(address?: Address): void {
    this.addressForm = this.fb.group({
      province: [address?.province || '', Validators.required],
      city: [address?.city || '', Validators.required],
      street: [address?.street || '', Validators.required],
      postalCode: [address?.postalCode || '', Validators.required],
      plaque: [address?.plaque || ''],
      isDefault: [address?.isDefault || false],
    });
  }

  // =========== آدرس‌ها ===========

  loadAddresses(): void {
    this.addressLoading = true;
    this.addressService.getAddresses().subscribe({
      next: (list) => {
        this.addresses = list;
        if (list.length > 0) {
          const def = list.find(a => a.isDefault) || list[0];
          this.selectedAddressId = def.id;
             console.log('✅ آدرس تنظیم شد:', def);
          this.addressStateService.setAddress(def);
        } else {
          this.showAddressForm = true;  // اگه آدرسی نیست، فرم رو باز کن
        }
        this.addressLoading = false;
      },
      error: (err) => {
        this.addressLoading = false;
        console.error('خطا در دریافت آدرس:', err);
        this.showAddressForm = true;
      },
    });
  }

  selectAddress(id: number): void {
    this.selectedAddressId = id;
    const addr = this.addresses.find(a => a.id === id);
    if (addr) {
      this.addressStateService.setAddress(addr);
    }
    this.showAddressForm = false;
  }

  openNewAddressForm(): void {
    this.editingAddress = null;
    this.buildForm();
    this.showAddressForm = true;
  }

  openEditForm(address: Address): void {
    this.editingAddress = address;
    this.buildForm(address);
    this.showAddressForm = true;
  }

  cancelForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
  }

  submitAddress(): void {
    if (this.addressForm.invalid) return;
    this.addressLoading = true;
    this.addressError = '';

    const dto = this.addressForm.value;

    const request$ = this.editingAddress
      ? this.addressService.updateAddress(this.editingAddress.id, dto)
      : this.addressService.createAddress(dto);

    request$.subscribe({
      next: (saved) => {
        this.showAddressForm = false;
        this.editingAddress = null;
        this.loadAddresses();
        this.selectedAddressId = saved.id;
        this.addressLoading = false;
      },
      error: (err) => {
        this.addressError = err.error?.message || 'خطا در ذخیره آدرس';
        this.addressLoading = false;
      },
    });
  }

  deleteAddress(id: number): void {
    if (!confirm('آیا مطمئن هستید؟')) return;
    this.addressService.deleteAddress(id).subscribe({
      next: () => this.loadAddresses(),
    });
  }

  // =========== کد تخفیف ===========

  private isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  applyDiscount(): void {
    if (this.discountForm.invalid) return;

    if (!this.isLoggedIn()) {
      this.discountError = 'برای استفاده از کد تخفیف ابتدا وارد حساب کاربری خود شوید';
      setTimeout(() => (this.discountError = null), 4000);
      return;
    }

    this.discountLoading = true;
    this.discountError = null;
    const code = this.discountForm.value.code;

    this.basketService.addDiscount({ code }).subscribe({
      next: () => {
        this.discountLoading = false;
        this.discountSuccess = 'کد تخفیف با موفقیت اعمال شد';
        this.appliedDiscountCode = code;
        this.discountForm.reset();
        this.basketStateService.refresh();
         this.basketStateService.setDiscountCode(code);
        setTimeout(() => (this.discountSuccess = null), 3000);
      },
      error: (err) => {
        this.discountLoading = false;
        this.discountError = err.error?.message || 'کد تخفیف نامعتبر است';
        setTimeout(() => (this.discountError = null), 5000);
      }
    });
  }

  removeDiscount(): void {
    if (!this.appliedDiscountCode) return;

    this.discountLoading = true;
    this.discountError = null;

    this.basketService.removeDiscount({ code: this.appliedDiscountCode }).subscribe({
      next: () => {
        this.discountLoading = false;
        this.discountSuccess = 'کد تخفیف حذف شد';
        this.appliedDiscountCode = null;
        this.basketStateService.refresh();
         this.basketStateService.setDiscountCode(null);
        setTimeout(() => (this.discountSuccess = null), 3000);
      },
      error: (err) => {
        this.discountLoading = false;
        this.discountError = err.error?.message || 'خطا در حذف کد تخفیف';
        setTimeout(() => (this.discountError = null), 5000);
      }
    });
  }

  // =========== پرداخت ===========

  get canSubmit(): boolean {
    return !!this.selectedAddressId && this.cartItems.length > 0 && !this.paymentLoading;
  }

  submitOrder(): void {
    if (!this.selectedAddressId) return;
    this.paymentLoading = true;
    this.paymentError = '';

    this.paymentService.createPayment(this.selectedAddressId).subscribe({
      next: (res) => {
        this.paymentLoading = false;
        if (res.gateWayUrl) {
          window.location.href = res.gateWayUrl;  // ریدایرکت به درگاه
        } else {
          this.router.navigate(['/checkout/payment']);
        }
      },
      error: (err) => {
        this.paymentLoading = false;
        this.paymentError = err.error?.message || 'خطا در ثبت سفارش';
      },
    });
  }

  // =========== محاسبه قیمت ===========

  goToProductDetail(item: CartItem, event: Event): void {
    if (event) {
      event.stopPropagation()
    }
    if (item.id) {
      this.router.navigate(['/productDetail', item.id]);
    } else if (item.slug) {
      this.router.navigate(['/product', item.slug]);
    }
  }

  getItemFinalPrice(item: CartItem): number {
    if (item.discountType === 'percent' && item.discountValue > 0) {
      return Math.max(item.price - Math.round(item.price * item.discountValue / 100), 0);
    }
    if (item.discountType === 'amount' && item.discountValue > 0) {
      return Math.max(item.price - item.discountValue, 0);
    }
    return item.price;
  }

  getItemLineTotal(item: CartItem): number {
    return this.getItemFinalPrice(item) * item.quantity;
  }

  increaseItemQuantity(item: CartItem): void {
    this.basketStateService.changeQuantity(item.id, 1);
  }

  decreaseItemQuantity(item: CartItem): void {
    this.basketStateService.changeQuantity(item.id, -1);
  }

  getItemOldLineTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

}