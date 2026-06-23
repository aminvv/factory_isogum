import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { ArticlesComponent } from './articles/articles/articles.component';
import { SignUpComponent } from './auth/sign-up-in/sign-up.component';
import { ProductDetailPageComponent } from './product-detail-page/product-detail-page.component';
import { AlertComponent } from './alert/alert.component';
import { BasketComponent } from './basket/basket.component';
import { CheckoutBasketCartComponent } from './shared/checkout-basket-cart/checkout-basket-cart.component';
import { ShippingComponent } from './shared/shipping/shipping.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'productDetail/:id', component: ProductDetailPageComponent },
  { path: 'checkout', component: CheckoutBasketCartComponent },
  { path: 'checkout/shipping', component: ShippingComponent },
  // { path: 'checkout/payment', component: PaymentResultComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
