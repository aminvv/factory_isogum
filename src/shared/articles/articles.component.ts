import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_CONFIG } from '../../common/api/api.config';

interface Blog {
  id: number;
  title: string;
  description: string;
  slug: string;
  category: string;
  status: string;
  thumbnail: Array<{ url: string; publicId: string }>;
  create_at: string;
}

interface BlogResponse {
  blog: Blog[];
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
})
export class ArticlesComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  limit = 9;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
      console.log('load called');
    this.loading = true;
    this.http.get<BlogResponse>(
      `${API_CONFIG.baseUrl}/blog/get-blogs?page=${this.currentPage}&limit=${this.limit}`
    ).subscribe({
      next: (res) => {
  console.log(res);
  console.log(res.blog);

  this.blogs = res.blog;
  this.totalPages = res.pagination.pageCount || 1;
  this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  goToDetail(id: number) {
    this.router.navigate(['/articles', id]);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getImage(blog: Blog): string {
    return blog.thumbnail?.[0]?.url || 'https://via.placeholder.com/400x250?text=Blog';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}