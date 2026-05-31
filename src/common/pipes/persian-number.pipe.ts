import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'persianNumber' })
export class PersianNumberPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value === null || value === undefined) return '';
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return value.toString().replace(/\d/g, d => persianDigits[parseInt(d, 10)]);
  }
}
