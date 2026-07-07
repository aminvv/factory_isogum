import { Component, OnInit } from '@angular/core';
import { ContactPage, ContactService } from './service/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  data: ContactPage | null = null;
  loading = true;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.get().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
          console.error('خطا در دریافت اطلاعات:', err);
        this.loading = false;
      },
    });
  }

getIconClass(platform: string): string {
  const icons: { [key: string]: string } = {
    'instagram': 'fa-instagram',
    'telegram': 'fa-telegram',
    'whatsapp': 'fa-whatsapp',
    'linkedin': 'fa-linkedin-in',
    'twitter': 'fa-twitter',
    'youtube': 'fa-youtube',
    'facebook': 'fa-facebook-f',
    'spotify': 'fa-spotify',
    'github': 'fa-github',
    'pinterest': 'fa-pinterest-p'
  };
  return icons[platform?.toLowerCase()] || 'fa-share-alt';
}
}