// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // وارد کردن صحیح

import { JalaliPipe } from '../common/pipes/alali.pipe';
import { PersianNumberPipe } from '../common/pipes/persian-number.pipe';
import { SafeHtmlPipe } from '../common/pipes/safe-html.pipe';
import { CommentComponent } from './product-comment.page/comment.component';
import { RelatedProductsComponent } from './related-products.component/related-products.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CheckoutBasketCartComponent } from './checkout-basket-cart/checkout-basket-cart.component';
import { FooterComponent } from '../home/footer/footer.component';

@NgModule({
  declarations: [
    CommentComponent,
    RelatedProductsComponent,
    NavbarComponent,
    JalaliPipe,
    PersianNumberPipe,
    SafeHtmlPipe,
    CheckoutBasketCartComponent,
    FooterComponent, 
    
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  exports: [
    JalaliPipe,
    PersianNumberPipe,
    SafeHtmlPipe,
    RelatedProductsComponent,
    NavbarComponent,
    CommentComponent,
    RouterModule,
    CheckoutBasketCartComponent,
    FooterComponent, 
  ]
})
export class SharedModule { }