import { Component, Input, OnInit } from '@angular/core';
import { BasketSummary, CartItem } from '../../basket/model/basket.model';
import { BasketService } from '../../basket/services/basket.service';
import { BasketStateService } from '../../basket/services/basket-state.service';
import { AuthStateService } from '../../auth/service/AuthStateSnapshot.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GuestBasketService } from '../../basket/services/guest-basket.service';

@Component({
  selector: 'app-checkout-basket-cart',
  templateUrl: './checkout-basket-cart.component.html',
  styleUrl: './checkout-basket-cart.component.css'
})
export class CheckoutBasketCartComponent implements OnInit {

  @Input() mode: 'dropdown' | 'page' = 'page';
  @Input() isCartDropdownOpen: boolean = true;
  loadingItems = false;
  cartSummary: BasketSummary = { itemsCount: 0, totalPrice: 0, finalAmount: 0, avgDiscountPercent: 0 };
  dropdownItems: CartItem[] = [];
  private subscription = new Subscription();
  quantityErrors: { [itemId: number]: string } = {};

  constructor(
    private basketService: BasketService,
    private basketStateService: BasketStateService,
    private guestBasketService: GuestBasketService,
    private authStateService: AuthStateService,
    private router: Router,
  ) { }



  ngOnInit(): void {
    this.subscription.add(
      this.basketStateService.items$.subscribe(items => {
        this.dropdownItems = items;
      })
    );

    this.subscription.add(
      this.basketStateService.summary$.subscribe(summary => {
        this.cartSummary = summary;
      })
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


    this.basketStateService.refresh();
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
    console.log("item.id",item.id);
    
  }

  goToProductDetail(item: CartItem,event:Event): void {
    if(event){
      event.stopPropagation()
    }
    if (item.id) {
      this.router.navigate(['/productDetail', item.id]);
    } else if (item.slug) {
      this.router.navigate(['/product', item.slug]);
    }
  }

  private isLoggedIn(): boolean {
    return this.authStateService.isLoggedIn();
  }

goToCheckout(): void {
  if (this.isLoggedIn()) {
    this.router.navigate(['/checkout/shipping']);
  } else {
    this.router.navigate(['/signup'], { queryParams: { redirect: 'checkout' } });
  }
}


clearAllItems(): void {
  if (this.dropdownItems.length === 0) return;

  if (confirm('آیا مطمئن هستید که همه کالاها را حذف کنید؟')) {
    const isLoggedIn = !!sessionStorage.getItem('accessToken');

    if (isLoggedIn) {
      this.basketService.clearBasket().subscribe({
        next: () => {
          this.basketStateService.reset();
        },
        error: (err) => console.error('خطا در حذف سبد خرید', err)
      });
    } else {
      this.guestBasketService.clearCart();
      this.basketStateService.reset();
    }
  }
}


}
