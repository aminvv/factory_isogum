import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductDetailService } from './services/product-detail.service';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent implements OnInit {
  quantity: number = 1;
  product?: Product;

  selectedImageIndex = 0;
  currentImageUrl: string = '';
  isZoomActive = false;
  zoomTransform: string = '';
  private zoomScale = 2.2;

  isZoomModalOpen = false;

  // به جای getter
  mainFeatures: any[] = [];
  hasExtraSpecsFlag: boolean = false;
  finalPrice: number = 0;

  saleTypeMap: { [key: string]: string } = {
    'CASH': 'نقدی',
    'CREDIT': 'اقساطی',
    'BOTH': 'نقد و اقساط'
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductDetailService,
    private cdr: ChangeDetectorRef
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
        this.updateFeaturesAndFlags();
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  private updateFeaturesAndFlags(): void {
    if (!this.product) {
      this.mainFeatures = [];
      this.hasExtraSpecsFlag = false;
      this.finalPrice = 0;
      return;
    }
    const saleTypeText = this.saleTypeMap[this.product.saleType || ''] || this.product.saleType || '—';
    this.mainFeatures = [
      { label: 'طول عمر', value: this.product.lifespan || '—', icon: 'fas fa-hourglass-start' },
      { label: 'وزن', value: this.product.weight || '—', icon: 'fas fa-weight-scale' },
      { label: 'ضخامت', value: this.product.thickness || '—', icon: 'fas fa-ruler-combined' },
      { label: 'نوع فروش', value: saleTypeText, icon: 'fas fa-tag' },
      { label: 'زمان تحویل', value: this.product.deliveryTime || '—', icon: 'fas fa-truck' },
      { label: 'هزینه ارسال', value: this.product.deliveryCost || '—', icon: 'fas fa-dollar-sign' },
      { label: 'موجودی', value: this.product.quantity + ' عدد', icon: 'fas fa-boxes-stacked' },
      { label: 'کد محصول', value: this.product.productCode, icon: 'fas fa-barcode' }
    ];
    this.hasExtraSpecsFlag = !!(this.product.details?.length || this.product.description ||
                               this.product.returnable !== undefined || this.product.insurance !== undefined);
    this.finalPrice = this.calcFinalPrice(this.product);
  }

  private calcFinalPrice(product: Product): number {
    if (product.active_discount && product.discount && +product.discount > 0) {
      return product.price - (product.price * +product.discount / 100);
    }
    return product.price;
  }

  getFinalPrice(product: Product): number {
    return this.calcFinalPrice(product);
  }

  setCurrentImage(): void {
    this.currentImageUrl = this.product?.image?.[this.selectedImageIndex]?.url || 'assets/default.jpg';
  }

  changeMainImage(index: number): void {
    this.selectedImageIndex = index;
    this.setCurrentImage();
    this.resetZoom();
    this.cdr.markForCheck();
  }

  // ✅ زوم ماوس به همان شکل قبلی (سینکرون) – بدون throttling
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
    // با OnPush باید view رو به‌روز کنیم
    this.cdr.markForCheck();
  }

  resetZoom(): void {
    this.zoomTransform = `scale(1) translate(0%, 0%)`;
    this.cdr.markForCheck();
  }

  openZoomModal(): void {
    this.isZoomModalOpen = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  closeZoomModal(): void {
    this.isZoomModalOpen = false;
    document.body.style.overflow = '';
    this.cdr.markForCheck();
  }

  increaseQuantity(): void {
    this.quantity++;
    this.cdr.markForCheck();
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
    this.cdr.markForCheck();
  }

  scrollTo(targetId: string): void {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  hasExtraSpecs(): boolean {
    return this.hasExtraSpecsFlag;
  }
}