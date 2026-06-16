import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GuestCartItem } from '../model/guest-basket.model';



const STORAGE_KEY = 'guestCart';

@Injectable({ providedIn: 'root' })
export class GuestBasketService {
  private cartSubject = new BehaviorSubject<GuestCartItem[]>(this.loadFromStorage());
  cart$ = this.cartSubject.asObservable();

  private loadFromStorage(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: GuestCartItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  getCart(): GuestCartItem[] {
    return this.cartSubject.value;
  }

  isEmpty(): boolean {
    return this.cartSubject.value.length === 0;
  }

  addToCart(item: GuestCartItem): void {
    const items = [...this.cartSubject.value];
    const existing = items.find(i => i.productId === item.productId);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push({ ...item });
    }

    this.saveToStorage(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = [...this.cartSubject.value];
    const target = items.find(i => i.productId === productId);
    if (target) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      target.quantity = quantity;
      this.saveToStorage(items);
    }
  }

  removeFromCart(productId: number): void {
    const items = this.cartSubject.value.filter(i => i.productId !== productId);
    this.saveToStorage(items);
  }

  clearCart(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.cartSubject.next([]);
  }

  getTotalQuantity(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.quantity, 0);
  }
}