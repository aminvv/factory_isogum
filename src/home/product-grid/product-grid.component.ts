import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { Product, ProductService } from './services/product.service';
import { Router } from '@angular/router';




declare global {
  interface Window {
    kofiWidgetOverlay: any;
  }
}

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent implements AfterViewInit, OnInit {
  products: Product[] = [];
  page = 1;
  limit = 6;
  isLoading = false;
  totalProducts = 0;
  hasMoreProducts = true;
  private router = inject(Router);

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.page, this.limit).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalProducts = res.pagination.totalCount;
        this.hasMoreProducts = this.products.length < this.totalProducts;
        console.log('📦 Products loaded:', this.products);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
        this.isLoading = false;
      }
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
        console.log('🔄 More products loaded. Total:', this.products.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading more products:', err);
        this.isLoading = false;
        this.hasMoreProducts = false;
      }
    });
  }



  ngAfterViewInit(): void {
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('mohamedghulam', {
        type: 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#323842',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  }
}