import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SlidePublicService } from './slide.service';
import { SlideItem } from './model/slide.model';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.css']
})
export class SliderComponent implements OnInit, OnDestroy {
  slides: SlideItem[] = [];
  autoPlay = true;
  autoPlayInterval = 5000;

  currentIndex = 0;
  private timerId: any = null;
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(private slideService: SlidePublicService) {}

  ngOnInit(): void {
    this.slideService.getAll().subscribe({
      next: (data) => {
        this.slides = data;
        if (this.autoPlay && this.slides.length > 1) this.startAutoPlay();
      },
      error: (err) => console.error('خطا در دریافت اسلایدها', err)
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.timerId = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoPlay(): void {
    if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
    if (this.autoPlay) this.startAutoPlay();
  }

  onMouseEnter(): void { this.stopAutoPlay(); }
  onMouseLeave(): void { if (this.autoPlay && this.slides.length > 1) this.startAutoPlay(); }

  onTouchStart(event: TouchEvent): void { this.touchStartX = event.changedTouches[0].screenX; }
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;
    if (diff > 50) this.next();
    else if (diff < -50) this.prev();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.next();
    else if (event.key === 'ArrowRight') this.prev();
  }
}