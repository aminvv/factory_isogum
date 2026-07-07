import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AboutPage, AboutService } from './service/about.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
  data: AboutPage | null = null;
  loading = true;
  safeDescription: SafeHtml =''
  
  constructor(
    private aboutService: AboutService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.aboutService.get().subscribe({
      next: (res) => {
        this.data = res;
        this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(res.description);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}