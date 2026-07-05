import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface OrderDetail {
  id: number;
  status: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  create_at: string;
  user: {
    firstName: string;
    lastName: string;
    mobile: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: string;
    product: {
      productName: string;
      productCode: string;
      image: Array<{ url: string }>;
      deliveryTime: string;
      deliveryCost: string;
    };
  }>;
  shippingAddress: {
    province: string;
    city: string;
    street: string;
    postalCode: string;
    plaque: string;
  };
  payment: {
    invoice_number: string;
    refId: string;
    amount: number;
  };
}

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss'],
})
export class PaymentSuccessComponent implements OnInit {
  order: OrderDetail | null = null;
  loading = true;
  error = false;
  orderId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParams['order_no'];
    if (this.orderId) {
      this.loadOrder();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadOrder() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<OrderDetail>(`http://localhost:4000/orders/${this.orderId}`, { headers })
      .subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        },
      });
  }

  get totalQuantity(): number {
    return this.order?.orderItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  trackOrder() {
    this.router.navigate(['/profile/orders', this.orderId]);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}