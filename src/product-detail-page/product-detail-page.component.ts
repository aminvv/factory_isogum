import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductDetailService, Discount } from './services/product-detail.service';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent implements OnInit {
  @ViewChild('quantityInput') quantityInput!: ElementRef<HTMLInputElement>;

  displayQuantity: string = '۱';
  quantity: number = 1;
  product?: Product;
  private intervalId: any = null;
  quantityError: string = '';

  // Gallery
  selectedImageIndex = 0;
  currentImageUrl: string = '';
  isZoomActive = false;
  zoomTransform: string = '';
  private zoomScale = 2.2;
  isZoomModalOpen = false;

  // Features
  mainFeatures: any[] = [];
  hasExtraSpecsFlag: boolean = false;

  // Price & Discount
  finalPrice: number = 0;
  discountPercent: number = 0;
  discountAmount: number = 0;
  hasDiscount: boolean = false;
  discountType: 'percent' | 'amount' | null = null;

  saleTypeMap: { [key: string]: string } = {
    'CASH': 'نقدی',
    'CREDIT': 'اقساطی',
    'BOTH': 'نقد و اقساط'
  };

  private persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductDetailService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
    this.updateDisplay();
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.setCurrentImage();

        this.productService.getProductDiscounts(res.id).subscribe({
          next: (discounts: Discount[]) => {
            this.product!.discounts = discounts;
            this.calculateDiscountFromArray();
            this.updateFeaturesAndFlags();
            this.cdr.markForCheck();
          },
          error: () => {
            this.calculateDiscountFallback();
            this.updateFeaturesAndFlags();
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => console.error(err)
    });
  }

  private calculateDiscountFromArray(): void {
    if (!this.product) return;
    let bestPercent = 0, bestAmount = 0;
    if (this.product.discounts?.length) {
      for (const d of this.product.discounts) {
        if (d.type !== 'product') continue;
        if (d.code) continue;
        if (d.percent && d.percent > bestPercent) bestPercent = d.percent;
        if (d.amount && d.amount > bestAmount) bestAmount = d.amount;
      }
    }
    if (bestPercent > 0) {
      this.discountType = 'percent';
      this.discountPercent = bestPercent;
      this.discountAmount = 0;
      this.hasDiscount = true;
      this.finalPrice = this.product.price - (this.product.price * bestPercent / 100);
    } else if (bestAmount > 0) {
      this.discountType = 'amount';
      this.discountPercent = 0;
      this.discountAmount = bestAmount;
      this.hasDiscount = true;
      this.finalPrice = this.product.price - bestAmount;
    } else {
      this.fallbackToActiveDiscount();
    }
    if (this.finalPrice < 0) this.finalPrice = 0;
    this.cdr.markForCheck();
  }

  private fallbackToActiveDiscount(): void {
    if (this.product?.active_discount && this.product.discount && +this.product.discount > 0) {
      const percent = +this.product.discount;
      this.discountType = 'percent';
      this.discountPercent = percent;
      this.hasDiscount = true;
      this.finalPrice = this.product.price - (this.product.price * percent / 100);
    } else {
      this.discountType = null;
      this.discountPercent = 0;
      this.discountAmount = 0;
      this.hasDiscount = false;
      this.finalPrice = this.product?.price || 0;
    }
  }

  private calculateDiscountFallback(): void {
    this.fallbackToActiveDiscount();
  }

  private updateFeaturesAndFlags(): void {
    if (!this.product) return;
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
  }

  // ------ Gallery, Zoom ------
  setCurrentImage(): void {
    this.currentImageUrl = this.product?.image?.[this.selectedImageIndex]?.url || 'assets/default.jpg';
  }

  changeMainImage(index: number): void {
    this.selectedImageIndex = index;
    this.setCurrentImage();
    this.resetZoom();
    this.cdr.markForCheck();
  }

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

  addToCart(): void {
    console.log('Add to cart:', this.product?.id, this.quantity);
  }

  // ---------- تبدیل اعداد ----------
  toPersian(num: number): string {
    return num.toString().replace(/\d/g, d => this.persianDigits[parseInt(d)]);
  }

  toEnglish(str: string): number {
    let eng = str;
    for (let i = 0; i < this.persianDigits.length; i++) {
      eng = eng.replace(new RegExp(this.persianDigits[i], 'g'), i.toString());
    }
    return parseInt(eng, 10) || 1;
  }

  updateDisplay(): void {
    this.displayQuantity = this.toPersian(this.quantity);
    if (this.quantityInput) {
      this.quantityInput.nativeElement.value = this.displayQuantity;
    }
  }

  onQuantityInput(e: Event): void {
    let v = this.toEnglish((e.target as HTMLInputElement).value);
    if (v < 1) v = 1;
    if (this.product && v > this.product.quantity) {
      this.quantityError = `حداکثر ${this.product.quantity} عدد`;
      v = this.product.quantity;
    } else {
      this.quantityError = '';
    }
    this.quantity = v;
    this.updateDisplay();
    this.cdr.markForCheck();
  }

  increaseQuantity(): void {
    if (this.product && this.quantity >= this.product.quantity) {
      this.quantityError = `حداکثر ${this.product.quantity} عدد`;
      return;
    }
    this.quantity++;
    this.quantityError = '';
    this.updateDisplay();
    this.cdr.markForCheck();
  }

  decreaseQuantity(): void {
    if (this.quantity <= 1) return;
    this.quantity--;
    this.quantityError = '';
    this.updateDisplay();
    this.cdr.markForCheck();
  }

  startIncreasing(): void {
    this.stopChanging();
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          if (this.product && this.quantity >= this.product.quantity) {
            this.stopChanging();
            this.quantityError = `حداکثر ${this.product.quantity} عدد`;
            this.updateDisplay();
            this.cdr.markForCheck();
            return;
          }
          this.quantity++;
          this.quantityError = '';
          this.updateDisplay();
          this.cdr.markForCheck();
        });
      }, 100);
    });
  }

  startDecreasing(): void {
    this.stopChanging();
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          if (this.quantity > 1) {
            this.quantity--;
            this.quantityError = '';
            this.updateDisplay();
            this.cdr.markForCheck();
          } else {
            this.stopChanging();
          }
        });
      }, 100);
    });
  }

  stopChanging(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
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

  scrollTo(targetId: string): void {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  hasExtraSpecs(): boolean {
    return this.hasExtraSpecsFlag;
  }
}