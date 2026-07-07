
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { SliderComponent } from './home/slider/slider.component';
import { ProductGridComponent } from './home/product-grid/product-grid.component';
import { BlogSectionComponent } from './home/blog-section/blog-section.component';
import { SignUpComponent } from './auth/sign-up-in/sign-up.component';
import { ProductDetailPageComponent } from './product-detail-page/product-detail-page.component';
import { AlertComponent } from './alert/alert.component';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';
import { ProductService } from './home/product-grid/services/product.service';
import { CertificateComponent } from './home/certificate/certificate.component';
import { SharedModule } from './shared/shared.module';
import { BasketComponent } from './basket/basket.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { SafeUrlPipe } from './common/pipes/safe-url.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    SliderComponent,
    ProductGridComponent,
    ProductDetailPageComponent,
    BlogSectionComponent,
    SignUpComponent,
    ProductDetailPageComponent,
    AlertComponent,
    CertificateComponent,
    BasketComponent,
    AboutComponent,
    ContactComponent,
    SafeUrlPipe,




  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ProductService
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 