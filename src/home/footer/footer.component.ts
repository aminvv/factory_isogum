import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: false, // اگر از NgModule استفاده می‌کنید false بماند
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  email: string = '';
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';

  onSubscribe() {
    if (!this.email.trim()) {
      this.showMessage('لطفاً ایمیل خود را وارد کنید.', 'error');
      return;
    }
    const emailPattern = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.showMessage('ایمیل وارد شده معتبر نیست.', 'error');
      return;
    }
    // در اینجا درخواست HTTP ارسال کنید
    console.log('اشتراک خبرنامه با ایمیل:', this.email);
    this.showMessage('عضویت شما با موفقیت ثبت شد!', 'success');
    this.email = '';
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.messageText = msg;
    this.messageType = type;
    setTimeout(() => {
      this.messageText = '';
    }, 4000);
  }
}