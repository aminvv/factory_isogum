import { Component } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {


  isBlue = false;

  onChange() {
    this.isBlue = !this.isBlue;
  }

}
