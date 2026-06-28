import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../common/api/api.config';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  linkedin: string;
  enamad: string;
  samandehi: string;
  paymentGateways: string[];
  newsletterEnabled: boolean;
  newsletterText: string;
  footerLinks: {
    title: string;
    links: { label: string; url: string }[];
  }[];
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  settings: SiteSettings | null = null;
  newsletterEmail = '';
  newsletterSent = false;
  currentYear = new Date().getFullYear();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<SiteSettings>(`${API_CONFIG.baseUrl}/site-settings`).subscribe({
      next: (data) => this.settings = data,
    });
  }

  subscribeNewsletter() {
    if (!this.newsletterEmail) return;
    // اینجا میتونی endpoint خبرنامه رو صدا بزنی
    this.newsletterSent = true;
    this.newsletterEmail = '';
  }

  get socialLinks() {
    return [
      { icon: 'ti-brand-instagram', url: this.settings?.instagram, label: 'اینستاگرام' },
      { icon: 'ti-brand-telegram',  url: this.settings?.telegram,  label: 'تلگرام' },
      { icon: 'ti-brand-whatsapp',  url: this.settings?.whatsapp,  label: 'واتساپ' },
      { icon: 'ti-brand-linkedin',  url: this.settings?.linkedin,  label: 'لینکدین' },
    ].filter(s => s.url);
  }

  get paymentGatewayLabels(): Record<string, string> {
    return {
      zarinpal: 'زرین‌پال',
      idpay: 'آیدی پی',
      parsian: 'پارسیان',
    };
  }
}