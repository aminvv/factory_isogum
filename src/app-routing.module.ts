import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { ArticlesComponent } from './articles/articles/articles.component';
import { SignUpComponent } from './auth/sign-up-in/sign-up.component';
import { ProductDetailPageComponent } from './product-detail-page/product-detail-page.component';
import { CheckoutBasketCartComponent } from './shared/checkout-basket-cart/checkout-basket-cart.component';
import { ShippingComponent } from './shared/shipping/shipping.component';
import { PaymentSuccessComponent } from './shared/payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './shared/payment/payment-failed/payment-failed.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'productDetail/:id', component: ProductDetailPageComponent },
  { path: 'checkout', component: CheckoutBasketCartComponent },
  { path: 'checkout/shipping', component: ShippingComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/failedUrl', component: PaymentFailedComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
