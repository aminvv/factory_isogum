import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  mobile?: string;
  fullName?: string;
}

export interface AuthStateSnapshot {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

const EMPTY_STATE: AuthStateSnapshot = { isLoggedIn: false, user: null };

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private stateSubject = new BehaviorSubject<AuthStateSnapshot>(this.readFromStorage());
  state$ = this.stateSubject.asObservable();

  constructor(private router: Router) {}

  private readFromStorage(): AuthStateSnapshot {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return EMPTY_STATE;

    const user = this.decodeToken(token);
    return user ? { isLoggedIn: true, user } : EMPTY_STATE;
  }

  private decodeToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        mobile: payload.mobile,
        fullName: payload.fullName,
      };
    } catch {
      return null;
    }
  }

  // بعد از signup/signIn موفق صدا زده میشه (وقتی accessToken تو sessionStorage ست شد)
  refresh(): void {
    this.stateSubject.next(this.readFromStorage());
  }

  getSnapshot(): AuthStateSnapshot {
    return this.stateSubject.value;
  }

  isLoggedIn(): boolean {
    return this.stateSubject.value.isLoggedIn;
  }

  logout(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('otpToken');
    this.stateSubject.next(EMPTY_STATE);
    this.router.navigate(['/signup']);
  }
}