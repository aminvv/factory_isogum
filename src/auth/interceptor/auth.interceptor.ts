import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../service/Auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = sessionStorage.getItem('accessToken')
    let authReq = req

    if (accessToken) {
      authReq.clone({
        setHeaders: { Authorization: `Bearer${accessToken}` }
      })
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          if (!this.refreshInProgress) {
            this.refreshInProgress = true
            this.refreshTokenSubject.next(null)

            return this.authService.refreshToken().pipe(



              tap((res: any) => {
                if (res?.accessToken) {
                  sessionStorage.setItem('accessToken', res.accessToken)
                  this.refreshTokenSubject.next(res.accessToken)
                } else {
                  this.refreshTokenSubject.next(null)
                }
              }),


              switchMap((res: any) => {
                const newToken = res?.accessToken || sessionStorage.getItem('accessToken')
                if (!newToken) {
                  this.handleLogout();
                  return throwError(() => err);
                }
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                return next.handle(retryReq)

              }),



              catchError((refreshErr) => {
                this.handleLogout();
                return throwError(() => refreshErr);
              }),



              finalize(() => {
                this.refreshInProgress = false;
              })



            )
          } else {
            return this.refreshTokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap((token) => {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
                return next.handle(retryReq);
              })
            )

          }
        }
        return throwError(() => err);
      }
      )
    )



  }
  
  private handleLogout() {
    sessionStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};





