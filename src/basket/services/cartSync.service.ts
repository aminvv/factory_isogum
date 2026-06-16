import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GuestBasketService } from './guest-basket.service';
import { BasketService } from '../../basket/services/basket.service';
import { AddToBasketDto } from '../../basket/model/basket.model';

@Injectable({ providedIn: 'root' })
export class CartSyncService {
  constructor(
    private guestBasketService: GuestBasketService,
    private basketService: BasketService,
  ) { }

  syncGuestCartToServer(): Observable<{ success: boolean; failedItems: AddToBasketDto[] }> {
    const guestItems = this.guestBasketService.getCart();

    if (guestItems.length === 0) {
      return of({ success: true, failedItems: [] });
    }

    const requests = guestItems.map(item => {
      const dto: AddToBasketDto = {
        productId: item.productId,
        quantity: item.quantity,
      };

      return this.basketService.addToBasket(dto).pipe(
        map(() => ({ success: true, item: dto })),
        catchError(() => of({ success: false, item: dto })),
      );
    });

    return forkJoin(requests).pipe(
      map(results => {
        const failedItems = results
          .filter(r => !r.success)
          .map(r => r.item);

        if (failedItems.length === 0) {
          this.guestBasketService.clearCart();
        }

        return {
          success: failedItems.length === 0,
          failedItems,
        };
      }),
    );
  }
}