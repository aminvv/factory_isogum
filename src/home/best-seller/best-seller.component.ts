import { Component, OnInit } from '@angular/core';
import { BestSellerProduct } from './model/best-seller.model';
import { BestSellerService } from './best-seller.service';

@Component({
  selector: 'app-best-seller',
  templateUrl: './best-seller.component.html',
  styleUrls: ['./best-seller.component.css']
})
export class BestSellerComponent implements OnInit {
  products: BestSellerProduct[] = [];
  loading = true;

  constructor(private bestSellerService: BestSellerService) {}

  ngOnInit(): void {
    this.bestSellerService.getBestSellers(4).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}