
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

  hasDiscount(product: Product): boolean {
    const discounts = (product as any).discounts;
    if (!discounts?.length) return false;
    const d = discounts[0];
    return (d.percent && +d.percent > 0) || (d.amount && +d.amount > 0);
  }

  getDiscountPercent(product: Product): string {
    const discounts = (product as any).discounts;
    if (!discounts?.length) return '';
    return discounts[0].percent || '';
  }

  getFinalPrice(product: Product): number {
    const discounts = (product as any).discounts;
    if (!discounts?.length) return product.price;
    const d = discounts[0];
    if (d.percent && +d.percent > 0) return product.price - (product.price * +d.percent / 100);
    if (d.amount && +d.amount > 0) return product.price - +d.amount;
    return product.price;
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
