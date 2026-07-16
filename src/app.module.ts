
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { ProductGridComponent } from './home/product-grid/product-grid.component';
import { BlogSectionComponent } from './home/blog-section/blog-section.component';
import { SignUpComponent } from './auth/sign-up-in/sign-up.component';
import { ProductDetailPageComponent } from './product-detail-page/product-detail-page.component';
import { AlertComponent } from './alert/alert.component';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';
import { ProductService } from './home/product-grid/services/product.service';
import { SharedModule } from './shared/shared.module';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { SafeUrlPipe } from './common/pipes/safe-url.pipe';
import { CertificatesComponent } from './home/certificate/certificates.component';
import { SpotlightComponent } from './home/spotlight/spotlight.component';
import { SliderComponent } from './home/slide/slide.component';
import { BestSellerComponent } from './home/best-seller/best-seller.component';


@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    SpotlightComponent,
    ProductGridComponent,
    ProductDetailPageComponent,
    BlogSectionComponent,
    SignUpComponent,
    AlertComponent,
    CertificatesComponent,
    AboutComponent,
    ContactComponent,
    SafeUrlPipe,
    SliderComponent,
    BestSellerComponent,




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
 