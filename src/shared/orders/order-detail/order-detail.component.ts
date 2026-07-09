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
      returnable: boolean;
      insurance: boolean;
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
    refId: string | null;
    amount: number;
    status: boolean;
    authority: string;
  };
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  order: OrderDetail | null = null;
  loading = true;
  error = false;

  statusMap: Record<string, string> = {
    pending: 'در انتظار پرداخت',
    ordered: 'در حال پردازش',
    inProcess: 'در حال آماده‌سازی',
    packed: 'بسته‌بندی شده',
    inTransit: 'در حال ارسال',
    delivered: 'تحویل داده شده',
    canceled: 'لغو شده',
  };

  statusColor: Record<string, string> = {
    pending: 'badge-warning',
    ordered: 'badge-blue',
    inProcess: 'badge-blue',
    packed: 'badge-blue',
    inTransit: 'badge-purple',
    delivered: 'badge-green',
    canceled: 'badge-red',
  };

  steps = ['ordered', 'inProcess', 'packed', 'inTransit', 'delivered'];

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(+id);
  }

  loadOrder(id: number) {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<OrderDetail>(`http://localhost:4000/orders/${id}`, { headers }).subscribe({
      next: (data) => { this.order = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  get currentStepIndex(): number {
    return this.steps.indexOf(this.order?.status || '');
  }

  get totalQuantity(): number {
    return this.order?.orderItems.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fa-IR').format(p);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/profile/orders']);
  }




  paying = false;

  payAgain() {
    if (!this.order) return;
    this.paying = true;
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<{ gateWayUrl: string }>(
      `http://localhost:4000/payment/retry/${this.order.id}`,
      {},
      { headers }
    ).subscribe({
      next: (res) => { window.location.href = res.gateWayUrl; },
      error: () => { this.paying = false; /* toast خطا */ },
    });
  }


}