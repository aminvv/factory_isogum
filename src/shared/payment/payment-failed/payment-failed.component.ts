import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface OrderDetail {
  id: number;
  status: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  create_at: string;
  payment: {
    invoice_number: string;
    refId: string | null;
    authority: string;
    amount: number;
  };
}

@Component({
  selector: 'app-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.css'],
})
export class PaymentFailedComponent implements OnInit {
  order: OrderDetail | null = null;
  loading = true;
  orderId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const authority = this.route.snapshot.queryParams['authority'];
    localStorage.setItem('payment_failed', 'true');

    if (authority) {
      this.loadOrderByAuthority(authority);
    } else {
      this.loading = false;
    }
  }

  loadOrder() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<OrderDetail>(`${environment.apiUrl}/orders/${this.orderId}`, { headers })
      .subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }


  loadOrderByAuthority(authority: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<OrderDetail>(`${environment.apiUrl}/payment/by-authority/${authority}`, { headers })
      .subscribe({
        next: (data) => { this.order = data; this.loading = false; },
        error: () => { this.loading = false; },
      });
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

  tryAgain() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}