import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../home/product-grid/services/product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
    styleUrls: ['./product-detail-page.component.css']
})
export class ProductDetailPageComponent implements OnInit{
  quantity: number = 1;
  product?: Product


  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }




    ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🟠 ID from route:', id); // <== باید مقدار درست بده

    if (id) {
      this.loadProduct(id);
    }
  }


  
 loadProduct(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        console.log('🟢 Product loaded:', this.product);
      },
      error: (err) => {
        console.error('❌ Error loading product:', err);
      }
    });
  }








  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  onQuantityInput(event: any) {
    const value = parseInt(event.target.value, 10);
    this.quantity = isNaN(value) || value < 1 ? 1 : value;
  }

  scrollTo(targetId: string) {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }





}
