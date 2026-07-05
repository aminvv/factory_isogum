// comment.component.ts - نسخه نهایی با مدیریت لاگین و نمایش پیام مناسب
import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommentService, CommentResponse } from './services/comment.service';
import { CommentStats, ProductComment } from './model/comment.model';
import { BAD_WORDS } from './model/bad-words.constants.ts';

@Component({
  selector: 'app-product-comments',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() productId!: number;
  @Input() productName!: string;
  @Output() statsChange = new EventEmitter<CommentStats>();

  comments: ProductComment[] = [];
  showForm: boolean = true;
  pagination: any = null;
  currentPage = 1;
  limit = 10;
  loading = false;
  error = '';
  submitLoading = false;

  userRating: number = 0;
  averageRating: number = 0;
  totalRatings: number = 0;
  sortOrder: string = 'newest';

  commentForm: FormGroup;
  replyTo: { id: number; text: string } | null = null;








  private badWords = BAD_WORDS

  private containsBadWord(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.badWords.some(word => lowerText.includes(word.toLowerCase()));
  }







  constructor(
    private commentService: CommentService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    if (this.productId) this.loadComments();
  }

  // بررسی وضعیت لاگین بر اساس توکن
  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    return !!token;
  }

  // هدایت به صفحه ورود
  goToLogin(): void {
    this.router.navigate(['/signup']);
  }

  // بارگذاری نظرات
  loadComments(): void {
    this.loading = true;
    this.commentService.getComments(this.productId, this.currentPage, this.limit).subscribe({
      next: (res: CommentResponse) => {
        this.comments = (res.comments || []).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.pagination = res.pagination || null;
        this.updateAverageRating();
        this.loading = false;
        this.cdr.detectChanges();



        this.statsChange.emit({
           total:this. totalRatings,
           averageRating: this.averageRating
        })
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
        } else {
          this.error = 'خطا در دریافت نظرات';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

updateAverageRating(): void {
  this.totalRatings = this.comments.length;  
  const ratings = this.comments.filter(c => c.rating && c.rating > 0).map(c => c.rating);
  this.averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
}

  changePage(page: number): void {
    if (page < 1 || (this.pagination && page > this.pagination.pageCount)) return;
    this.currentPage = page;
    this.loadComments();
  }

  setRating(star: number): void {
    this.userRating = star;
  }


  submitComment(): void {
    if (!this.isLoggedIn()) {
      this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
      return;
    }
    if (this.commentForm.invalid) {
      this.error = 'متن نظر باید حداقل ۳ کاراکتر باشد';
      return;
    }
    const textValue = this.commentForm.value.text?.trim();
    if (!textValue) {
      this.error = 'لطفاً متن نظر را وارد کنید';
      return;
    }

    if (this.containsBadWord(textValue)) {
      this.error = '❌ متن نظر شامل کلمات نامناسب است. لطفاً اصلاح کنید.';
      return;
    }

    const payload: any = {
      text: textValue,
      productId: String(this.productId),   // رشته
    };
    if (this.userRating > 0) {
      payload.rating = String(this.userRating);   // رشته
    }
    if (this.replyTo && this.replyTo.id) {
      payload.parentId = String(this.replyTo.id);
      delete payload.rating;
    }

    this.submitLoading = true;
    this.error = '';
    this.commentService.addComment(payload).subscribe({
      next: () => {
        this.commentForm.reset();
        this.replyTo = null;
        this.userRating = 0;
        this.submitLoading = false;
        this.loadComments();
        this.error = '✅ نظر شما با موفقیت ثبت شد';
        setTimeout(() => this.error = '', 3000);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
        } else if (err.status === 400 && err.error?.message) {
          this.error = Array.isArray(err.error.message) ? err.error.message.join('، ') : err.error.message;
        } else {
          this.error = 'ارسال نظر با مشکل مواجه شد.';
        }
        this.submitLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // پاسخ به نظر
  setReply(comment: ProductComment): void {
    if (!this.isLoggedIn()) {
      this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
      return;
    }
    this.replyTo = { id: comment.id, text: comment.text };
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelReply(): void {
    this.replyTo = null;
  }

  // حذف نظر
  deleteComment(commentId: number): void {
    if (!this.isLoggedIn()) {
      this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
      return;
    }
    if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;
    this.commentService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(),
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.error = '⛔ لطفاً وارد حساب کاربری خود شوید.';
        } else {
          this.error = 'خطا در حذف نظر';
        }
      }
    });
  }

  getDisplayName(comment: ProductComment): string {
    if (comment.user?.firstName) return comment.user.firstName;
    if (comment.user?.phone) return comment.user.phone;
    if (comment.admin?.fullName) return comment.admin.fullName;
    return 'کاربر';
  }

  canDelete(comment: ProductComment): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
    return (currentUser?.id && comment.userId === currentUser.id) || !!currentAdmin?.id;
  }
}