import { Router } from '@angular/router';
import { RelatedProductsService } from './services/related-products.service';
import { Product } from '../../product-detail-page/services/product-detail.service';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.css']
})
export class RelatedProductsComponent implements OnInit {
  @Input() currentProductId!: number;
  relatedProducts: (Product & { finalPrice?: number; discountPercent?: number; discountAmount?: number; hasDiscount?: boolean })[] = [];
  loading = false;

  constructor(
    private relatedService: RelatedProductsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.currentProductId) {
      this.loadRelated();
    }
  }


  loadRelated(): void {
    this.loading = true;
    this.relatedService.getRelatedProducts(this.currentProductId).subscribe({
      next: (products) => {
        this.relatedProducts = products;
        this.loading = false;
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