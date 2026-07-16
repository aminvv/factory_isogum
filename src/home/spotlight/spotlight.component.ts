import { Component, OnInit } from '@angular/core';
import { ProductSpotlightDetails } from './model/product-spotlight.model';
import { ProductSpotlightService } from './product-spotlight.service';

@Component({
  selector: 'app-spotlight',
  templateUrl: './spotlight.component.html',
  styleUrls: ['./spotlight.component.css']
})
export class SpotlightComponent implements OnInit {
  spotlight: ProductSpotlightDetails | null = null;
  loading = true;

  constructor(private spotlightService: ProductSpotlightService) {}

  ngOnInit(): void {
    this.spotlightService.getActive().subscribe({
      next: (data) => {
        this.spotlight = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}