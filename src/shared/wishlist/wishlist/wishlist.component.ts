import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface WishlistItem {
  id: number;
  created_at: string;
  product: {
    id: number;
    productName: string;
    price: number;
    slug: string;
    quantity: number;
    rating: string;
    image: Array<{ url: string }>;
  };
}

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadWishlist(); }

  get headers() {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadWishlist() {
    this.http.get<WishlistItem[]>(`${environment.apiUrl}/wishlist`, { headers: this.headers }).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  remove(productId: number) {
    this.http.delete(`${environment.apiUrl}/wishlist/${productId}`, { headers: this.headers }).subscribe({
      next: () => this.items = this.items.filter(i => i.product.id !== productId),
    });
  }

  goToProduct(slug: string) {
    this.router.navigate(['/productDetail', slug]);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fa-IR').format(p);
  }

  stars(rating: string): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  ratingNum(rating: string): number {
    return Math.round(parseFloat(rating));
  }
}