import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'persianNumber' })
export class PersianNumberPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null) return '';
    
    // اگه عدد خالصه، فرمت هزارگان بزن
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim()))) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      const formatted = num.toLocaleString('en-US');
      return this.toPersianDigits(formatted);
    }
    
    // وگرنه فقط ارقام داخل string رو فارسی کن (مثل "500 گرم")
    return this.toPersianDigits(value.toString());
  }

  private toPersianDigits(str: string): string {
    const persianDigits: { [key: string]: string } = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
    };
    return str.replace(/\d/g, d => persianDigits[d]);
  }
}