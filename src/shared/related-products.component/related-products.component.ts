import { Router } from '@angular/router';
import { RelatedProductsService } from './services/related-products.service';
import { Product } from '../../product-detail-page/services/product-detail.service';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { WishlistService } from '../wishlist/wishlist/Wishlist.service';
@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.css']
})
export class RelatedProductsComponent implements OnInit {
  @Input() currentProductId!: number;
  relatedProducts: (Product & { finalPrice?: number; discountPercent?: number; discountAmount?: number; hasDiscount?: boolean })[] = [];
  loading = false;
  isWishlisted = false;

  constructor(
    private relatedService: RelatedProductsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {
    if (this.currentProductId) {
      this.loadRelated();
    }
  }



wishlistedIds = new Set<number>();

checkWishlist(productId: number) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return;
  this.wishlistService.check(productId).subscribe({
    next: (res) => {
      if (res.isWishlisted) this.wishlistedIds.add(productId);
      else this.wishlistedIds.delete(productId);
      this.cdr.markForCheck();
    }
  });
}

isProductWishlisted(productId: number): boolean {
  return this.wishlistedIds.has(productId);
}

toggleWishlist(productId: number) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) { alert('برای افزودن به علاقه‌مندی‌ها لاگین کنید'); return; }

  if (this.wishlistedIds.has(productId)) {
    this.wishlistService.remove(productId).subscribe({
      next: () => { this.wishlistedIds.delete(productId); this.cdr.markForCheck(); }
    });
  } else {
    this.wishlistService.add(productId).subscribe({
      next: () => { this.wishlistedIds.add(productId); this.cdr.markForCheck(); }
    });
  }
}

  loadRelated(): void {
    this.loading = true;
    this.relatedService.getRelatedProducts(this.currentProductId).subscribe({
      next: (products) => {
        this.relatedProducts = products;
        this.loading = false;
         products.forEach(p => this.checkWishlist(p.id));
        this.cdr.markForCheck();
      },
    });
  }


  goToProductDetail(id: number): void {
    if (id) {
      this.router.navigate(['/productDetail', id]);
    }
  }




  getRatingStars(rating: number): string[] {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const stars: string[] = [];
    for (let i = 0; i < full; i++) stars.push('fas fa-star');
    if (half) stars.push('fas fa-star-half-alt fa-flip-horizontal');
    for (let i = 0; i < empty; i++) stars.push('far fa-star');
    return stars;
  }
}