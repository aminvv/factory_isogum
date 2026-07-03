import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../../../common/api/api.config';

interface Comment {
  id: number;
  text: string;
  accepted: boolean;
  created_at: string;
  user?: { firstName: string };
  admin?: { fullName: string };
  children?: Comment[];
}

interface Blog {
  id: number;
  title: string;
  description: string;
  content: string;
  slug: string;
  category: string;
  thumbnail: Array<{ url: string }>;
  create_at: string;
  update_at: string;
}





@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css'],
})
export class ArticleDetailComponent implements OnInit {
  blog: Blog | null = null;
  comments: Comment[] = [];
  loading = true;
  commentText = '';
  submitting = false;
  replyingTo: number | null = null;
  replyText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(+id);
  }

  load(id: number) {
    this.http.get<{ blog: Blog; commentsData: { comments: Comment[] } }>(
      `${API_CONFIG.baseUrl}/blog/get-blog/${id}`
    ).subscribe({
      next: (res) => {
        this.blog = res.blog;
        this.comments = res.commentsData.comments;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }






  toggleReply(commentId: number) {
    if (this.replyingTo === commentId) {
      this.replyingTo = null;
      this.replyText = '';
      return;
    }

    this.replyingTo = commentId;
    this.replyText = '';
  }

  submitReply(parentId: number) {
    if (!this.replyText.trim()) return;

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      alert('ابتدا وارد شوید');
      return;
    }

    this.submitting = true;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${API_CONFIG.baseUrl}/blog-comment`, {
      blogId: String(this.blog?.id),
      parentId,
      text: this.replyText
    }, { headers }).subscribe({
      next: () => {
        this.replyText = '';
        this.replyingTo = null;
        this.submitting = false;
        this.load(this.blog!.id);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }





  submitComment() {
    if (!this.commentText.trim()) return;
    const token = sessionStorage.getItem('accessToken');
    if (!token) { alert('برای ثبت دیدگاه لاگین کنید'); return; }

    this.submitting = true;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.post(`${API_CONFIG.baseUrl}/blog-comment`, {
      blogId: String(this.blog?.id),
      parentId: 0,
      text: this.commentText,
    }, { headers }).subscribe({
      next: () => {
        this.commentText = '';
        this.submitting = false;
        this.load(this.blog!.id);
      },
      error: (err) => {
        this.submitting = false;
      }
    });
  }

  getImage(): string {
    return this.blog?.thumbnail?.[0]?.url || 'https://via.placeholder.com/800x400?text=Blog';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  getAuthor(comment: Comment): string {
    return comment.user?.firstName || comment.admin?.fullName || 'کاربر';
  }

  goBack() { this.router.navigate(['/articles']); }
}