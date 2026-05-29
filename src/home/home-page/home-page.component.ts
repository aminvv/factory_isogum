import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import AOS from 'aos'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  ngOnInit(): void {
    let tanker = document.getElementById('tanker') as HTMLElement
    let factory = document.getElementById('factory') as HTMLElement
    let img = document.getElementById('img') as HTMLElement
    AOS.init()

    window.addEventListener('scroll', () => {
      let value = window.scrollY;
      if(value <350){
      tanker.style.left = value * 1 + 'px'
      factory.style.top = value * 0.2 + 'px'
      img.style.filter = value * 10 + '%'

    }



    })

  }
 


}
 