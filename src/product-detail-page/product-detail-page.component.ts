import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductDetailService } from './services/product-detail.service';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.css']
})
export class ProductDetailPageComponent implements OnInit {
  quantity: number = 1;
  product?: Product;

  // Gallery properties
  selectedImageIndex = 0;
  currentImageUrl: string = '';
  isZoomActive = false;
  zoomTransform: string = '';
  private zoomScale = 2.2;

  // Modal zoom
  isZoomModalOpen = false;

  // Translation map for saleType enum
  saleTypeMap: { [key: string]: string } = {
    'CASH': 'نقدی',
    'CREDIT': 'اقساطی',
    'BOTH': 'نقد و اقساط'
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductDetailService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.setCurrentImage();
        console.log('Product loaded:', this.product);
      },
      error: (err) => {
        console.error('Error loading product:', err);
      }
    });
  }

  // ----- Image Gallery -----
  setCurrentImage(): void {
    if (this.product?.image && this.product.image.length > 0) {
      this.currentImageUrl = this.product.image[this.selectedImageIndex]?.url || 'assets/default.jpg';
    } else {
      this.currentImageUrl = 'assets/default.jpg';
    }
  }

  changeMainImage(index: number): void {
    this.selectedImageIndex = index;
    this.setCurrentImage();
    this.resetZoom();
  }

  // ----- Hover Zoom -----
  handleZoomMove(event: MouseEvent): void {
    if (!this.isZoomActive) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);
    const percentX = x * 100;
    const percentY = y * 100;
    const moveX = (percentX - 50) * (this.zoomScale - 1) / this.zoomScale;
    const moveY = (percentY - 50) * (this.zoomScale - 1) / this.zoomScale;
    this.zoomTransform = `scale(${this.zoomScale}) translate(${-moveX}%, ${-moveY}%)`;
  }

  resetZoom(): void {
    this.zoomTransform = `scale(1) translate(0%, 0%)`;
  }

  // ----- Modal Zoom -----
  openZoomModal(): void {
    this.isZoomModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeZoomModal(): void {
    this.isZoomModalOpen = false;
    document.body.style.overflow = '';
  }

  // ----- Main features (getter - but it's okay if not too heavy) -----
  get mainFeatures() {
    if (!this.product) return [];
    const saleTypeText = this.saleTypeMap[this.product.saleType || ''] || this.product.saleType || '—';
    return [
      { label: 'طول عمر', value: this.product.lifespan || '—', icon: 'fas fa-hourglass-start' },
      { label: 'وزن', value: this.product.weight || '—', icon: 'fas fa-weight-scale' },
      { label: 'ضخامت', value: this.product.thickness || '—', icon: 'fas fa-ruler-combined' },
      { label: 'نوع فروش', value: saleTypeText, icon: 'fas fa-tag' },
      { label: 'زمان تحویل', value: this.product.deliveryTime || '—', icon: 'fas fa-truck' },
      { label: 'هزینه ارسال', value: this.product.deliveryCost || '—', icon: 'fas fa-dollar-sign' },
      { label: 'موجودی', value: this.product.quantity + ' عدد', icon: 'fas fa-boxes-stacked' },
      { label: 'کد محصول', value: this.product.productCode, icon: 'fas fa-barcode' }
    ];
  }

  hasExtraSpecs(): boolean {
    return (this.product?.details && this.product.details.length > 0) ||
           !!this.product?.description ||
           this.product?.returnable !== undefined ||
           this.product?.insurance !== undefined;
  }

  // ----- Quantity & Price -----
  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  getFinalPrice(product: Product): number {
    if (product.active_discount && product.discount && +product.discount > 0) {
      return product.price - (product.price * +product.discount / 100);
    }
    return product.price;
  }

  scrollTo(targetId: string): void {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getRatingStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars: string[] = [];
    for (let i = 0; i < fullStars; i++) stars.push('★');
    if (halfStar) stars.push('½');
    for (let i = 0; i < emptyStars; i++) stars.push('☆');
    return stars;
  }

  addToCart(): void {
    console.log('Add to cart:', this.product?.id, this.quantity);
  }
}