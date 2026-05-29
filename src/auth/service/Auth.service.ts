import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SendOtpCodePayload, AuthPayload, VerifyOtpCodePayload } from '../dto/signup-payload.interface';
import { API_CONFIG } from '../../common/api/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.auth}`;

  constructor(private http: HttpClient) { }

  signup(payload: AuthPayload): Observable<any> {
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(
      key => formData.set(key, payload[key as keyof AuthPayload])
    );

    const otpToken = sessionStorage.getItem('otpToken');
    if (otpToken) formData.set('otpToken', otpToken);

    return this.http.post(`${this.baseUrl}/signup`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }


  signIn(payload: AuthPayload): Observable<any> {
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(
      key => formData.set(key, payload[key as keyof AuthPayload])
    );

    const otpToken = sessionStorage.getItem('otpToken');
    if (otpToken) formData.set('otpToken', otpToken);

    return this.http.post(`${this.baseUrl}/signin`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }








  sendOtpCode(payload: SendOtpCodePayload): Observable<any> {
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(
      key => formData.set(key, payload[key as keyof SendOtpCodePayload])
    );

    return this.http.post(`${this.baseUrl}/createOtp`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }








  verifyOtpCode(payload: VerifyOtpCodePayload): Observable<any> {
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(
      key => formData.set(key, payload[key as keyof VerifyOtpCodePayload])
    );

    return this.http.post(`${this.baseUrl}/verifyOtp`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }










  checkMobile(mobile: string) {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-mobile/${mobile}`);
  }




  refreshToken() {
     return this.http.post(`${this.baseUrl}/refresh`,{},{withCredentials:true})
  }


}
