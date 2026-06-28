import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

interface ProductComment {
  id: number;
  text: string;
  rating: number | null;
  accepted: boolean;
  created_at: string;
  product: {
    productName: string;
    slug: string;
    image: Array<{ url: string }>;
  };
}

interface BlogComment {
  id: number;
  text: string;
  accepted: boolean;
  created_at: string;
  blog: {
    title: string;
    slug: string;
    thumbnail: Array<{ url: string }>;
  };
}

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.css'],
})
export class CommentsListComponent implements OnInit {
  productComments: ProductComment[] = [];
  blogComments: BlogComment[] = [];
  loading = true;
  activeTab: 'product' | 'blog' = 'product';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadAll(); }

  get headers() {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAll() {
    forkJoin({
      product: this.http.get<ProductComment[]>('http://localhost:4000/product-comment/my', { headers: this.headers }),
      blog: this.http.get<BlogComment[]>('http://localhost:4000/blog-comment/my', { headers: this.headers }),
    }).subscribe({
      next: ({ product, blog }) => {
        this.productComments = product;
        this.blogComments = blog;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  goToProduct(slug: string) {
    this.router.navigate(['/productDetail', slug]);
  }

  goToBlog(slug: string) {
    this.router.navigate(['/articles', slug]);
  }

  deleteProductComment(id: number) {
    if (!confirm('آیا از حذف این دیدگاه مطمئن هستید؟')) return;
    this.http.delete(`http://localhost:4000/product-comment/delete/${id}`, { headers: this.headers }).subscribe({
      next: () => this.productComments = this.productComments.filter(c => c.id !== id),
    });
  }

  deleteBlogComment(id: number) {
    if (!confirm('آیا از حذف این دیدگاه مطمئن هستید؟')) return;
    this.http.delete(`http://localhost:4000/blog-comment/delete/${id}`, { headers: this.headers }).subscribe({
      next: () => this.blogComments = this.blogComments.filter(c => c.id !== id),
    });
  }

  stars(rating: number | null): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}