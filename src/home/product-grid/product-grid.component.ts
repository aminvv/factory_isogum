
import { Component, OnInit, inject } from '@angular/core';
import { Product, ProductService } from './services/product.service';
import { Router } from '@angular/router';
import { BasketService } from '../../basket/services/basket.service';
import { BasketStateService } from '../../basket/services/basket-state.service';
import { GuestBasketService } from '../../basket/services/guest-basket.service';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent implements OnInit {
  products: Product[] = [];
  page = 1;
  limit = 9;
  isLoading = false;
  totalProducts = 0;
  hasMoreProducts = true;
  private router = inject(Router);

  constructor(
    private productService: ProductService,
    private basketService: BasketService,
    private basketStateService: BasketStateService,
    private guestBasketService: GuestBasketService,
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.page, this.limit).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalProducts = res.pagination.totalCount;
        this.hasMoreProducts = this.products.length < this.totalProducts;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  loadMore() {
    if (!this.hasMoreProducts) return;
    this.page++;
    this.isLoading = true;
    this.productService.getProducts(this.page, this.limit).subscribe({
      next: (res) => {
        this.products = [...this.products, ...res.products];
        this.hasMoreProducts = this.products.length < this.totalProducts;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.hasMoreProducts = false; },
    });
  }

  getImage(product: Product): string {
    return (product as any).image?.[0]?.url || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=بدون+عکس';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price);
  }




private getBestDiscount(product: Product): { type: 'percent' | 'amount' | null; percent: number; amount: number } {
  const p: any = product;
  let bestPercent = 0, bestAmount = 0;

  if (p.discounts?.length) {
    for (const d of p.discounts) {
      if (d.type !== 'product') continue;
      if (d.code) continue;
      if (d.percent && +d.percent > bestPercent) bestPercent = +d.percent;
      if (d.amount && +d.amount > bestAmount) bestAmount = +d.amount;
    }
  }

  if (bestPercent > 0) {
    return { type: 'percent', percent: bestPercent, amount: 0 };
  }
  if (bestAmount > 0) {
    return { type: 'amount', percent: 0, amount: bestAmount };
  }
  if (p.active_discount && p.discount && +p.discount > 0) {
    return { type: 'percent', percent: +p.discount, amount: 0 };
  }
  return { type: null, percent: 0, amount: 0 };
}





  

hasDiscount(product: Product): boolean {
  return this.getBestDiscount(product).type !== null;
}

getDiscountPercent(product: Product): string {
  const d = this.getBestDiscount(product);
  return d.type === 'percent' ? String(d.percent) : '';
}

getDiscountAmount(product: Product): number {
  const d = this.getBestDiscount(product);
  return d.type === 'amount' ? d.amount : 0;
}

getFinalPrice(product: Product): number {
  const d = this.getBestDiscount(product);
  let finalPrice = product.price;
  if (d.type === 'percent') {
    finalPrice = product.price - (product.price * d.percent / 100);
  } else if (d.type === 'amount') {
    finalPrice = product.price - d.amount;
  }
  return finalPrice < 0 ? 0 : finalPrice;
}




  isOutOfStock(product: Product): boolean {
    return ((product as any).quantity ?? 1) === 0;
  }

getStars(rating: string | number): string[] {
  const r = +rating;
  const full = Math.floor(r);
  const hasHalf = (r - full) >= 0.5;

  const stars: string[] = [];

  // ستاره‌های کامل (از چپ شروع می‌شوند)
  for (let i = 0; i < full; i++) {
    stars.push('ti-star-filled');
  }

  // نیم‌ستاره (اگر لازم باشد)
  if (hasHalf) {
    stars.push('ti-star-half-filled');
  }

  // بقیه ستاره‌ها خالی (تا ۵ تا)
  while (stars.length < 5) {
    stars.push('ti-star');
  }

  return stars;
}

  addToCart(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isOutOfStock(product)) return;

    const token = sessionStorage.getItem('accessToken');
    if (token) {
      this.basketService.addToBasket({ productId: product.id, quantity: 1 }).subscribe({
        next: () => { this.basketStateService.refresh(); alert('محصول به سبد خرید اضافه شد'); },
      });
    } else {
      this.guestBasketService.addToCart({
        productId: product.id,
        quantity: 1,
        productName: (product as any).productName || '',
        finalPrice: this.getFinalPrice(product),
        price: product.price,
        image: this.getImage(product),
        discountType: null,
        discountValue: 0,
        stock: (product as any).quantity || 0,
      });
      alert('محصول به سبد خرید اضافه شد');
    }
  }

  goToDetail(id: number) {
    this.router.navigate(['/productDetail', id]);
  }
}
