// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // وارد کردن صحیح

import { JalaliPipe } from '../common/pipes/alali.pipe';
import { PersianNumberPipe } from '../common/pipes/persian-number.pipe';
import { SafeHtmlPipe } from '../common/pipes/safe-html.pipe';
import { CommentComponent } from './product-comment.page/comment.component';

@NgModule({
  declarations: [
    CommentComponent,   
    JalaliPipe,         
    PersianNumberPipe,  
    SafeHtmlPipe        

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule   
  ],
  exports: [
    JalaliPipe,
    PersianNumberPipe,
    SafeHtmlPipe,
    CommentComponent      
  ]
})
export class SharedModule { }