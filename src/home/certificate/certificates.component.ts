import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificatesService } from './certificates.service';
import { Certificate } from './model/certificate.model';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  certificates = signal<Certificate[]>([]);
  selected = signal<Certificate | null>(null);
  loading = signal(true);
  error = signal(false);

  constructor(private certService: CertificatesService) {}

  ngOnInit(): void {
    this.certService.getActiveCertificates().subscribe({
      next: (data) => {
        this.certificates.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  open(cert: Certificate) {
    this.selected.set(cert);
  }

  close() {
    this.selected.set(null);
  }
}