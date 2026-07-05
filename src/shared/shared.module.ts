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
import { ShippingComponent } from './shipping/shipping.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './payment/payment-failed/payment-failed.component';
import { ProfileComponent } from '../profile/profile.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { WishlistComponent } from './wishlist/wishlist/wishlist.component';
import { AccountInfoComponent } from './account-info/account-info/account-info.component';
import { AddressListComponent } from './addresses/address-list/address-list.component';
import { CommentsListComponent } from './comments/comments-list/comments-list.component';
import { ArticleDetailComponent } from './articles/article-detail/article-detail.component';
import { ArticlesComponent } from './articles/articles.component';
import { AddressStateService } from './shipping/services/address-state.service';

@NgModule({
  declarations: [
    CommentComponent,
    RelatedProductsComponent,
    NavbarComponent,
    JalaliPipe,
    PersianNumberPipe,
    ShippingComponent,
    SafeHtmlPipe,
    CheckoutBasketCartComponent,
    FooterComponent,
    PaymentSuccessComponent,
    PaymentFailedComponent,
    ProfileComponent,
    OrderListComponent,
    OrderDetailComponent,
    WishlistComponent,
    AccountInfoComponent,
    AddressListComponent,
    CommentsListComponent,
    ArticlesComponent,
    ArticleDetailComponent,

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
  ],

})
export class SharedModule { }