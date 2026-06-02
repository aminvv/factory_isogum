// product-detail-page/product-comment/comment.component.ts
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommentService, CommentResponse } from './services/comment.service';
import { ProductComment } from './model/comment.model';

@Component({
  selector: 'app-product-comments',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() productId!: number;

  comments: ProductComment[] = [];
  pagination: any = null;
  currentPage = 1;
  limit = 10;
  loading = false;
  error = '';
  submitLoading = false;

  // امتیازدهی
  userRating: number = 0;
  averageRating: number = 0;
  totalRatings: number = 0;
  sortOrder: string = 'newest';   // برای مرتب‌سازی (در صورت نیاز)

  commentForm: FormGroup;
  replyTo: { id: number; text: string } | null = null;

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
    if (this.productId) {
      this.loadComments();
    }
  }

  // ========== وضعیت لاگین ==========
  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    return !!token;
  }

  goToLogin(): void {
    this.router.navigate(['/signup']);
  }

  // ========== بارگذاری نظرات ==========
  loadComments(): void {
    this.loading = true;
    this.commentService.getComments(this.productId, this.currentPage, this.limit).subscribe({
      next: (res: CommentResponse) => {
        this.comments = res.comments || [];
        this.pagination = res.pagination || null;
        this.updateAverageRating();   // محاسبه میانگین امتیاز پس از دریافت نظرات
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('خطا در دریافت نظرات:', err);
        this.error = 'خطا در دریافت نظرات';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // محاسبه میانگین امتیاز بر اساس نظراتی که دارای فیلد rating هستند
  updateAverageRating(): void {
    const ratings = this.comments.filter(c => c.rating && c.rating > 0).map(c => c.rating);
    this.totalRatings = ratings.length;
    if (ratings.length) {
      const sum = ratings.reduce((a, b) => a + b, 0);
      this.averageRating = sum / ratings.length;
    } else {
      this.averageRating = 0;
    }
  }

  changePage(page: number): void {
    if (page < 1 || (this.pagination && page > this.pagination.pageCount)) return;
    this.currentPage = page;
    this.loadComments();
  }

  // ========== ارسال نظر ==========
submitComment(): void {
  if (!this.isLoggedIn()) {
    this.error = 'لطفاً ابتدا وارد شوید';
    return;
  }
  if (this.commentForm.invalid) return;

  const textValue = this.commentForm.value.text?.trim();
  if (!textValue) {
    this.error = 'متن نظر نمی‌تواند خالی باشد';
    return;
  }

  const payload: any = {
    text: textValue,
    productId: String(this.productId),
    rating: this.userRating || 0
  };
  if (this.replyTo && this.replyTo.id) {
    payload.parentId = String(this.replyTo.id);
    if (payload.rating) delete payload.rating;
  }

  this.submitLoading = true;
  this.commentService.addComment(payload).subscribe({
    next: () => {
      this.commentForm.reset();
      this.replyTo = null;
      this.userRating = 0;
      this.submitLoading = false;
      this.loadComments();
    },
    error: (err) => {
      console.error(err);
      this.error = 'ارسال نظر با مشکل مواجه شد';
      this.submitLoading = false;
    }
  });
}  

  // ========== تنظیم امتیاز ==========
  setRating(star: number): void {
    this.userRating = star;
  }

showForm: boolean = false;

scrollToForm() {
  this.showForm = true;
  document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
}



newCommentText: string = '';

toggleForm() {
  this.showForm = !this.showForm;
}

prepareReply(comment: ProductComment) {
  this.setReply(comment);
  this.showForm = true;
  document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
}

submitNewComment() {
  this.commentForm.get('text')?.setValue(this.newCommentText);
  this.submitComment();
}

  // ========== پاسخ به نظر ==========
  setReply(comment: ProductComment): void {
    if (!this.isLoggedIn()) {
      this.error = 'لطفاً ابتدا وارد حساب کاربری خود شوید.';
      return;
    }
    this.replyTo = { id: comment.id, text: comment.text };
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelReply(): void {
    this.replyTo = null;
  }

  // ========== حذف نظر ==========
  deleteComment(commentId: number): void {
    if (!this.isLoggedIn()) {
      this.error = 'لطفاً ابتدا وارد حساب کاربری خود شوید.';
      return;
    }
    if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadComments();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('خطا در حذف نظر:', err)
    });
  }

  // ========== نمایش نام کاربر ==========
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