import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { SignUpComponent } from './auth/sign-up-in/sign-up.component';
import { ProductDetailPageComponent } from './product-detail-page/product-detail-page.component';
import { CheckoutBasketCartComponent } from './shared/checkout-basket-cart/checkout-basket-cart.component';
import { ShippingComponent } from './shared/shipping/shipping.component';
import { PaymentSuccessComponent } from './shared/payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './shared/payment/payment-failed/payment-failed.component';
import { ProfileComponent } from './profile/profile.component';
import { OrderListComponent } from './shared/orders/order-list/order-list.component';
import { OrderDetailComponent } from './shared/orders/order-detail/order-detail.component';
import { AddressListComponent } from './shared/addresses/address-list/address-list.component';
import { CommentsListComponent } from './shared/comments/comments-list/comments-list.component';
import { WishlistComponent } from './shared/wishlist/wishlist/wishlist.component';
import { AccountInfoComponent } from './shared/account-info/account-info/account-info.component';
import { ArticleDetailComponent } from './shared/articles/article-detail/article-detail.component';
import { ArticlesComponent } from './shared/articles/articles.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'productDetail/:id', component: ProductDetailPageComponent },
  { path: 'checkout', component: CheckoutBasketCartComponent },
  { path: 'checkout/shipping', component: ShippingComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/failedUrl', component: PaymentFailedComponent },


  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'addresses', component: AddressListComponent },
      { path: 'comments', component: CommentsListComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'account', component: AccountInfoComponent },
    ]
  },

  { path: 'articles', component: ArticlesComponent },
  { path: 'articles/:id', component: ArticleDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
