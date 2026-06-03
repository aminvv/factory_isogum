// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JalaliPipe } from '../common/pipes/alali.pipe';
import { PersianNumberPipe } from '../common/pipes/persian-number.pipe';

@NgModule({
  declarations: [
    JalaliPipe,
    PersianNumberPipe
  ],
  imports: [CommonModule],
  exports: [
    JalaliPipe,
    PersianNumberPipe   
  ]
})
export class SharedModule { }