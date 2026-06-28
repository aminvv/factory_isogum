import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  role: string;
  create_at: string;
  last_login: string;
}

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css'],
})
export class AccountInfoComponent implements OnInit {
  user: UserProfile | null = null;
  loading = true;
  editMode = false;
  saving = false;
  successMsg = '';

  form = {
    firstName: '',
    lastName: '',
    mobile: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadProfile(); }

  get headers() {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadProfile() {
    this.http.get<UserProfile>('http://localhost:4000/user/profile', { headers: this.headers }).subscribe({
      next: (data) => {
        this.user = data;
        this.form = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          mobile: data.mobile || '',
        };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.successMsg = '';
    if (!this.editMode && this.user) {
      this.form = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        mobile: this.user.mobile || '',
      };
    }
  }

  save() {
    this.saving = true;
    const body = new URLSearchParams();
    Object.entries(this.form).forEach(([k, v]) => { if (v) body.set(k, v); });
    const headers = this.headers.set('Content-Type', 'application/x-www-form-urlencoded');

    this.http.patch('http://localhost:4000/user/profile', body.toString(), { headers }).subscribe({
      next: (data: any) => {
        this.user = data;
        this.saving = false;
        this.editMode = false;
        this.successMsg = 'اطلاعات با موفقیت ذخیره شد';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.saving = false; },
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}