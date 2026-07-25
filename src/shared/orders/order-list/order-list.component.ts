import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  create_at: string;
  orderItems: Array<{
    quantity: number;
    price: string;
    product: {
      productName: string;
      image: Array<{ url: string }>;
      deliveryCost: string;
    };
  }>;
  payment: {
    status: boolean;
    amount: number;
    invoice_number: string;
  };
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  activeTab: string = 'all';

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

  tabs = [
    { key: 'all', label: 'همه' },
    { key: 'active', label: 'جاری' },
    { key: 'delivered', label: 'تحویل شده' },
    { key: 'canceled', label: 'لغو شده' },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    
  ) { }

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Order[]>(`${environment.apiUrl}/orders`, { headers }).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get filteredOrders(): Order[] {
    if (this.activeTab === 'all') return this.orders;
    if (this.activeTab === 'active') return this.orders.filter(o => !['delivered', 'canceled'].includes(o.status));
    return this.orders.filter(o => o.status === this.activeTab);
  }

  countByTab(key: string): number {
    if (key === 'all') return this.orders.length;
    if (key === 'active') return this.orders.filter(o => !['delivered', 'canceled'].includes(o.status)).length;
    return this.orders.filter(o => o.status === key).length;
  }

  totalQuantity(order: Order): number {
    return order.orderItems?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fa-IR').format(p);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  goToDetail(id: number) {
    this.router.navigate(['/profile/orders', id]);
  }
}