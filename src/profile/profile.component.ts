import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '../auth/service/AuthStateSnapshot.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authState: AuthStateService
  ) { }

  ngOnInit() {
    if (!this.authState.isLoggedIn()) {
      this.router.navigate(['/signup']);
      return;
    }
    this.user = this.authState.getSnapshot().user;

    this.loadUser();
  }



  loadUser() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) { this.router.navigate(['/signup']); return; }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.apiUrl}/User/profile`, { headers }).subscribe({
      next: (data) => this.user = data,
      error: () => this.router.navigate(['/signup']),
    });
  }

  logout() {
    this.authState.logout();
  }
}