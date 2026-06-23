import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../service/Auth.service';
import { AlertService } from '../../alert/service/alert.service';
import { createSignUpForm } from '../form-config/signup-form.config';
import { AuthPayload } from '../dto/signup-payload.interface';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartSyncService } from '../../basket/services/cartSync.service';
import { AuthStateService } from '../service/AuthStateSnapshot.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit, AfterViewInit {

  private iranMobileRegex = /^09[0-9][0-9]{8}$/;

  isSignUp = true;
  formValid = false;
  isMobileValid = false;
  checkingMobile = false;

  otpTimer = 0;
  otpButtonText = 'دریافت کد';
  private _otpInterval: any;


  signupForm!: FormGroup;
  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private cartSyncService: CartSyncService,
    private router: Router,
    private route: ActivatedRoute,
    private authStateService: AuthStateService
  ) { }

  ngOnInit() {
    this.signupForm = createSignUpForm(this.fb);
    this.signupForm.get('mobile')?.valueChanges.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(mobile => {
      mobile = (mobile || '').trim();

      if (!mobile) {
        this.signupForm.get('mobile')?.setErrors(null);
        this.isMobileValid = false;
        this.resetOtpButton();
        return;
      }
      if (!this.iranMobileRegex.test(mobile)) {
        this.signupForm.get('mobile')?.setErrors({ invalid: true });
        this.isMobileValid = false;
        this.resetOtpButton();
        return;
      }

      this.signupForm.get('mobile')?.setErrors(null);
      this.checkMobileAuto(mobile);



      this.checkingMobile = true;
      this.authService.checkMobile(mobile).pipe(
        finalize(() => this.checkingMobile = false)
      ).subscribe(res => {
        if (this.isSignUp) {
          this.isMobileValid = !res.exists;
          if (res.exists) this.alertService.showAlert('error', 'این شماره قبلا ثبت‌نام کرده');
        } else {
          this.isMobileValid = res.exists;
          if (!res.exists) this.alertService.showAlert('error', 'این شماره ثبت نشده است');
        }
      });
    });




    this.signupForm.get('code')?.valueChanges.subscribe(value => {
      if (value && value.length === 5) this.verifyOtpAuto();
    });
  }

  private checkMobileAuto(mobile: string) {
    console.log('🚀 sending check to backend:', mobile);

    this.checkingMobile = true;
    this.authService.checkMobile(mobile).subscribe({
      next: res => {
        this.checkingMobile = false;
        console.log('Backend check:', res);

        if (this.isSignUp) {

          if (res.exists) {
            this.alertService.showAlert('error', 'این شماره قبلاً ثبت‌نام کرده است.');
            this.isMobileValid = false;
          } else {
            this.isMobileValid = true;
          }
        } else {

          if (res.exists) {
            this.isMobileValid = true;
          } else {
            this.alertService.showAlert('error', 'این شماره ثبت نشده است.');
            this.isMobileValid = false;
          }
        }


      },
      error: (err) => {
        this.checkingMobile = false;
        this.isMobileValid = false;
        console.error('Error from backend:', err);
      }
    });
  }

  sendOtpCode() {
    const mobile = this.signupForm.get('mobile')?.value;
    if (!mobile) return;

    this.authService.sendOtpCode({ mobile }).subscribe({
      next: res => {
        this.alertService.showAlert('success', res.message || 'کد ارسال شد.');
        sessionStorage.setItem('otpToken', res.otpToken);
        this.startOtpTimer();
      },
      error: (err: HttpErrorResponse) => {
        this.alertService.showAlert('error', err.error?.message || 'خطا در ارسال کد.');
      }
    });
  }

  private startOtpTimer() {
    this.otpTimer = 120;
    this.updateOtpButtonText();

    clearInterval(this._otpInterval);
    this._otpInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer > 0) {
        this.updateOtpButtonText();
      } else {
        clearInterval(this._otpInterval);
        sessionStorage.removeItem('otpToken')
        this.otpButtonText = 'ارسال مجدد کد';
      }
    }, 1000);
  }

  private updateOtpButtonText() {
    const minutes = Math.floor(this.otpTimer / 60);
    const seconds = this.otpTimer % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
    this.otpButtonText = `${formattedTime}`;
  }

  private resetOtpButton() {
    this.otpTimer = 0;
    clearInterval(this._otpInterval)
    this.otpButtonText = 'دریافت کد'
  }

  verifyOtpAuto() {
    const mobile = this.signupForm.get('mobile')?.value
    const codeControl = this.signupForm.get('code')
    if (!mobile || !codeControl?.value) return

    const otpToken = sessionStorage.getItem('otpToken')
    if (!otpToken) {
      this.alertService.showAlert('error', 'کد منقضی شده. دوباره کد دریافت کنید.')
      return;
    }

    this.authService.verifyOtpCode({ mobile, code: codeControl.value, otpToken }).subscribe({
      next: res => {
        this.alertService.showAlert('success', res.message || 'کد تأیید شد.')
        codeControl.setErrors(null)
        this.formValid = true

      },
      error: (err: HttpErrorResponse) => {
        codeControl.setErrors({ invalid: true })
        this.formValid = false
        this.alertService.showAlert('error', err.error?.message || 'کد اشتباه است.')
      }
    });
  }

  submit() {
    if (this.signupForm.invalid || !this.formValid) return;

    const payload: AuthPayload = {
      mobile: this.signupForm.value.mobile,
      code: this.signupForm.value.code
    };

    if (this.isSignUp) {
      this.authService.signup(payload).subscribe({
        next: res => {
          this.alertService.showAlert('success', res.message || 'ثبت‌نام موفقیت‌آمیز بود.')
          sessionStorage.setItem('accessToken', res.accessToken)
          sessionStorage.removeItem('otpToken');
          this.authStateService.refresh();
          this.afterLoginSuccess();
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showAlert('error', err.error?.message || 'خطا در ثبت‌نام.')
        }
      });
    } else {
      this.authService.signIn(payload).subscribe({
        next: res => {
          this.alertService.showAlert('success', res.message || 'ورود موفقیت‌آمیز بود.')
          sessionStorage.setItem('accessToken', res.accessToken)
          sessionStorage.removeItem('otpToken');
          this.authStateService.refresh();
          this.afterLoginSuccess();
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showAlert('error', err.error?.message || 'خطا در ورود.')
        }
      })
    }
  }

  private afterLoginSuccess() {
    this.cartSyncService.syncGuestCartToServer().subscribe(result => {
      if (!result.success) {
        console.warn('بعضی آیتم‌ها sync نشدن', result.failedItems);
      }
      setTimeout(() => this.router.navigate(['/']), 1500);
    });
        const redirect = this.route.snapshot.queryParams['redirect'];
    const target = redirect === 'checkout' ? '/checkout/shipping' : '/';
    this.cartSyncService.syncGuestCartToServer().subscribe(() => {
      setTimeout(() => this.router.navigate([target]), 1500);
    });
  }


  toggleForm(event?: Event) {
    event?.preventDefault();
    this.isSignUp = !this.isSignUp;
    this.signupForm.reset();
    this.formValid = false;
    this.resetOtpButton();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this._otpInterval);
  }

  ngAfterViewInit() {
    this.enableAutoDirection();
  }

  private enableAutoDirection() {
    const inputFields = document.querySelectorAll<HTMLInputElement>('.input__field');
    inputFields.forEach(input => {
      input.addEventListener('input', () => {
        if (/^[\u0600-\u06FF]/.test(input.value)) {
          input.style.direction = 'rtl';
          input.style.textAlign = 'right';
        } else {
          input.style.direction = 'ltr';
          input.style.textAlign = 'left';
        }
      });
    });
  }






}
