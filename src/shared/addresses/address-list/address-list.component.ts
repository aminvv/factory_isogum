import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Address {
  id: number;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  plaque: string;
  isDefault: boolean;
  created_at: string;
}

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.css'],
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  loading = true;
  showForm = false;
  editingAddress: Address | null = null;

  form = {
    province: '',
    city: '',
    street: '',
    postalCode: '',
    plaque: '',
    isDefault: false,
  };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadAddresses(); }

  get headers() {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAddresses() {
    this.loading = true;
    this.http.get<Address[]>(`${environment.apiUrl}/address`, { headers: this.headers }).subscribe({
      next: (data) => { this.addresses = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openAdd() {
    this.editingAddress = null;
    this.form = { province: '', city: '', street: '', postalCode: '', plaque: '', isDefault: false };
    this.showForm = true;
  }

  openEdit(address: Address) {
    this.editingAddress = address;
    this.form = {
      province: address.province,
      city: address.city,
      street: address.street,
      postalCode: address.postalCode,
      plaque: address.plaque || '',
      isDefault: address.isDefault,
    };
    this.showForm = true;
  }

  saveAddress() {
    const body = new URLSearchParams();
    Object.entries(this.form).forEach(([k, v]) => body.set(k, String(v)));
    const headers = this.headers.set('Content-Type', 'application/x-www-form-urlencoded');

    if (this.editingAddress) {
      this.http.patch(`${environment.apiUrl}/address/${this.editingAddress.id}`, body.toString(), { headers }).subscribe({
        next: () => { this.showForm = false; this.loadAddresses(); },
      });
    } else {
      this.http.post(`${environment.apiUrl}/address`, body.toString(), { headers }).subscribe({
        next: () => { this.showForm = false; this.loadAddresses(); },
      });
    }
  }

  deleteAddress(id: number) {
    if (!confirm('آیا از حذف این آدرس مطمئن هستید؟')) return;
    this.http.delete(`${environment.apiUrl}/address/${id}`, { headers: this.headers }).subscribe({
      next: () => this.loadAddresses(),
    });
  }

  cancel() { this.showForm = false; }
}
