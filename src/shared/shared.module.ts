// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JalaliPipe } from '../common/pipes/alali.pipe';
import { PersianNumberPipe } from '../common/pipes/persian-number.pipe';
import { SafeHtmlPipe } from '../common/pipes/safe-html.pipe';

@NgModule({
  declarations: [
    JalaliPipe,
    PersianNumberPipe,
    SafeHtmlPipe  
  ],
  imports: [CommonModule],
  exports: [
    JalaliPipe,
    PersianNumberPipe ,
    SafeHtmlPipe  
  ]
})
export class SharedModule { }