// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // وارد کردن صحیح

import { JalaliPipe } from '../common/pipes/alali.pipe';
import { PersianNumberPipe } from '../common/pipes/persian-number.pipe';
import { SafeHtmlPipe } from '../common/pipes/safe-html.pipe';
import { CommentComponent } from './product-comment.page/comment.component';
import { RelatedProductsComponent } from './related-products.component/related-products.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CommentComponent,
    RelatedProductsComponent,   
    JalaliPipe,         
    PersianNumberPipe,  
    SafeHtmlPipe        
    
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,   

  ],
  exports: [
    JalaliPipe,
    PersianNumberPipe,
    SafeHtmlPipe,
    RelatedProductsComponent,   
    CommentComponent,
    RouterModule      
  ]
})
export class SharedModule { }