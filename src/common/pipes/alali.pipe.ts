import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jalali'
})
export class JalaliPipe implements PipeTransform {
  transform(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  }
}