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
  thumbnail: Array<{ url: string; publicId: string }>;
  create_at: string;
}

@Component({
  selector: 'app-blog-section',
  templateUrl: './blog-section.component.html',
  styleUrls: ['./blog-section.component.css'],
})
export class BlogSectionComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<{ blog: Blog[] }>(`${API_CONFIG.baseUrl}/blog/get-blogs?page=1&limit=4`).subscribe({
      next: (res) => { this.blogs = res.blog; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  goToBlog(id: number) {
    this.router.navigate(['/articles', id]);
  }

  goToArticles() {
    this.router.navigate(['/articles']);
  }

  formatDate(dateStr: string): { day: string; month: string } {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('fa-IR', { day: 'numeric' });
    const month = date.toLocaleDateString('fa-IR', { month: 'long' });
    return { day, month };
  }

  getImage(blog: Blog): string {
    return blog.thumbnail?.[0]?.url || 'assets/default-blog.jpg';
  }
} 