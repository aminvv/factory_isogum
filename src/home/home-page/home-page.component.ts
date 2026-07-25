import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import AOS from 'aos'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {



  constructor() { }

  ngOnInit(): void {
    let tanker = document.getElementById('tanker') as HTMLElement
    let factory = document.getElementById('factory') as HTMLElement
    let img = document.getElementById('img') as HTMLElement
    AOS.init()

window.addEventListener('scroll', () => {
  let value = Math.min(window.scrollY, 350); 
  if (value < 350) {
    tanker.style.transform = `translateX(${value}px)`;
    factory.style.transform = `translateY(${value * 0.2}px)`;
  }
});






  }
}



